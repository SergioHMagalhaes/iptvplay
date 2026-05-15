import { indexedDB, IDBKeyRange } from "fake-indexeddb";
import Dexie from "dexie";
import { TestBed } from "@angular/core/testing";
import { PlaylistService, PLAYLIST_DB } from "./playlist.service";
import { PlaylistEntry } from "../../models/playlist.model";
import { PlaylistDatabase } from "../database/playlist.db";

/**
 * Testes unitários para PlaylistService
 * Mapeados aos requisitos de doc/requisitos_lista_reproducao.md
 *
 * Padrão: Arrange-Act-Assert
 *
 * Usa fake-indexeddb para simular o IndexedDB no ambiente de testes (jsdom).
 * A instância do Dexie é criada com o fake-indexeddb explicitamente.
 */
describe("PlaylistService", () => {
  let service: PlaylistService;
  let testDb: PlaylistDatabase;

  beforeEach(async () => {
    // Configura Dexie para usar fake-indexeddb
    Dexie.dependencies.indexedDB = indexedDB;
    Dexie.dependencies.IDBKeyRange = IDBKeyRange;

    testDb = new PlaylistDatabase(`test-db-${Date.now()}`);
    await testDb.open();

    TestBed.configureTestingModule({
      providers: [{ provide: PLAYLIST_DB, useValue: testDb }],
    });

    service = TestBed.inject(PlaylistService);
  });

  afterEach(async () => {
    if (testDb.isOpen()) {
      testDb.close();
    }
    await Dexie.delete(testDb.name);
  });

  // ── Req 2: Listagem ──────────────────────────────────────────────────
  describe("Req 2 - Listagem", () => {
    it("deve retornar todas as listas salvas", async () => {
      // Arrange
      const playlist: PlaylistEntry = {
        name: "Lista 1",
        sourceType: "xtream",
        domain: "https://servidor.com",
        username: "user",
        password: "pass",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await service.addPlaylist(playlist);

      // Act
      const result = await service.getAllPlaylists();

      // Assert
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some((p) => p.name === "Lista 1")).toBe(true);
    });

    it("deve retornar lista vazia quando não há playlists cadastradas", async () => {
      // Arrange — nenhuma playlist cadastrada

      // Act
      const result = await service.getAllPlaylists();

      // Assert
      expect(result).toEqual([]);
    });
  });

  // ── Req 2: Cadastro ──────────────────────────────────────────────────
  describe("Req 2 - Cadastro", () => {
    it("deve adicionar uma nova playlist do tipo Xtream e retornar o id gerado", async () => {
      // Arrange
      const playlist: PlaylistEntry = {
        name: "Minha Lista Xtream",
        sourceType: "xtream",
        domain: "https://servidor.com",
        username: "user1",
        password: "senha123",
        epgUrl: "https://epg.example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Act
      const id = await service.addPlaylist(playlist);

      // Assert
      expect(id).toBeGreaterThan(0);
    });

    it("deve adicionar uma nova playlist do tipo M3U/Xtream URL e retornar o id gerado", async () => {
      // Arrange
      const playlist: PlaylistEntry = {
        name: "Minha Lista M3U",
        sourceType: "m3u_url",
        url: "https://exemplo.com/playlist.m3u",
        forceM3u: true,
        epgUrl: "https://epg.example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Act
      const id = await service.addPlaylist(playlist);

      // Assert
      expect(id).toBeGreaterThan(0);
    });

    it("deve persistir os dados e recuperar a playlist pelo id", async () => {
      // Arrange
      const playlist: PlaylistEntry = {
        name: "Lista Persistida",
        sourceType: "xtream",
        domain: "192.168.1.1:8080",
        username: "admin",
        password: "admin123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const id = await service.addPlaylist(playlist);

      // Act
      const result = await service.getPlaylistById(id);

      // Assert
      expect(result).toBeDefined();
      expect(result!.name).toBe("Lista Persistida");
      expect(result!.sourceType).toBe("xtream");
      expect(result!.domain).toBe("192.168.1.1:8080");
    });
  });

  // ── Req 2: Edição ────────────────────────────────────────────────────
  describe("Req 2 - Edição", () => {
    it("deve atualizar os dados de uma playlist existente", async () => {
      // Arrange
      const playlist: PlaylistEntry = {
        name: "Lista Original",
        sourceType: "xtream",
        domain: "https://antigo.com",
        username: "user",
        password: "pass",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const id = await service.addPlaylist(playlist);

      // Act
      await service.updatePlaylist(id, {
        name: "Lista Atualizada",
        domain: "https://novo.com",
        updatedAt: new Date().toISOString(),
      });
      const updated = await service.getPlaylistById(id);

      // Assert
      expect(updated).toBeDefined();
      expect(updated!.name).toBe("Lista Atualizada");
      expect(updated!.domain).toBe("https://novo.com");
    });
  });

  // ── Req 2: Exclusão ──────────────────────────────────────────────────
  describe("Req 2 - Exclusão", () => {
    it("deve deletar uma playlist permanentemente do armazenamento", async () => {
      // Arrange
      const playlist: PlaylistEntry = {
        name: "Lista para Excluir",
        sourceType: "m3u_url",
        url: "https://exemplo.com/playlist.m3u",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const id = await service.addPlaylist(playlist);

      // Act
      await service.deletePlaylist(id);
      const result = await service.getPlaylistById(id);

      // Assert
      expect(result).toBeUndefined();
    });

    it("deve não encontrar a playlist deletada na listagem geral", async () => {
      // Arrange
      const playlist: PlaylistEntry = {
        name: "Lista Deletada",
        sourceType: "xtream",
        domain: "https://del.com",
        username: "u",
        password: "p",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const id = await service.addPlaylist(playlist);
      await service.deletePlaylist(id);

      // Act
      const all = await service.getAllPlaylists();

      // Assert
      expect(all.some((p) => p.name === "Lista Deletada")).toBe(false);
    });
  });

  // ── Req 4: Validação - Nome duplicado ────────────────────────────────
  describe("Req 4 - Validação de nome duplicado", () => {
    it("deve rejeitar a adição de uma playlist com nome já existente", async () => {
      // Arrange
      const playlist1: PlaylistEntry = {
        name: "Nome Único",
        sourceType: "xtream",
        domain: "https://srv1.com",
        username: "u1",
        password: "p1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await service.addPlaylist(playlist1);

      const playlist2: PlaylistEntry = {
        name: "Nome Único",
        sourceType: "m3u_url",
        url: "https://srv2.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Act & Assert
      await expect(service.addPlaylist(playlist2)).rejects.toThrow();
    });
  });

  // ── Req 6: Data de Expiração ─────────────────────────────────────────
  describe("Req 6 - Data de Expiração", () => {
    it("deve armazenar e retornar a data de expiração (expiresAt) fornecida pelo provedor", async () => {
      // Arrange
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const playlist: PlaylistEntry = {
        name: "Lista com Expiração",
        sourceType: "xtream",
        domain: "https://srv.com",
        username: "u",
        password: "p",
        expiresAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Act
      const id = await service.addPlaylist(playlist);
      const result = await service.getPlaylistById(id);

      // Assert
      expect(result).toBeDefined();
      expect(result!.expiresAt).toBe(expiresAt);
    });
  });

  // ── Req 8/9: Schema do IndexedDB ────────────────────────────────────
  describe("Req 9 - Schema do IndexedDB (campos)", () => {
    it("deve persistir todos os campos do schema Xtream corretamente", async () => {
      // Arrange
      const now = new Date().toISOString();
      const playlist: PlaylistEntry = {
        name: "Schema Test Xtream",
        sourceType: "xtream",
        domain: "192.168.1.1:8080",
        username: "admin",
        password: "s3nh@",
        epgUrl: "https://epg.test.com",
        expiresAt: "2026-12-31T23:59:59Z",
        createdAt: now,
        updatedAt: now,
      };

      // Act
      const id = await service.addPlaylist(playlist);
      const result = await service.getPlaylistById(id);

      // Assert
      expect(result).toBeDefined();
      expect(result!.name).toBe("Schema Test Xtream");
      expect(result!.sourceType).toBe("xtream");
      expect(result!.domain).toBe("192.168.1.1:8080");
      expect(result!.username).toBe("admin");
      expect(result!.password).toBe("s3nh@");
      expect(result!.epgUrl).toBe("https://epg.test.com");
      expect(result!.expiresAt).toBe("2026-12-31T23:59:59Z");
      expect(result!.createdAt).toBe(now);
      expect(result!.updatedAt).toBe(now);
    });

    it("deve persistir todos os campos do schema M3U/Xtream URL corretamente", async () => {
      // Arrange
      const now = new Date().toISOString();
      const playlist: PlaylistEntry = {
        name: "Schema Test M3U",
        sourceType: "m3u_url",
        url: "https://exemplo.com/lista.m3u8",
        forceM3u: true,
        epgUrl: "https://epg.test.com",
        createdAt: now,
        updatedAt: now,
      };

      // Act
      const id = await service.addPlaylist(playlist);
      const result = await service.getPlaylistById(id);

      // Assert
      expect(result).toBeDefined();
      expect(result!.name).toBe("Schema Test M3U");
      expect(result!.sourceType).toBe("m3u_url");
      expect(result!.url).toBe("https://exemplo.com/lista.m3u8");
      expect(result!.forceM3u).toBe(true);
      expect(result!.epgUrl).toBe("https://epg.test.com");
    });

    it("deve gerar id auto-incrementado ao adicionar playlists", async () => {
      // Arrange
      const now = new Date().toISOString();
      const p1: PlaylistEntry = {
        name: "Auto ID 1",
        sourceType: "xtream",
        domain: "d1",
        username: "u",
        password: "p",
        createdAt: now,
        updatedAt: now,
      };
      const p2: PlaylistEntry = {
        name: "Auto ID 2",
        sourceType: "xtream",
        domain: "d2",
        username: "u",
        password: "p",
        createdAt: now,
        updatedAt: now,
      };

      // Act
      const id1 = await service.addPlaylist(p1);
      const id2 = await service.addPlaylist(p2);

      // Assert
      expect(id1).toBeGreaterThan(0);
      expect(id2).toBeGreaterThan(id1);
    });
  });
});
