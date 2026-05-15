import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { provideRouter, Router, ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { vi } from "vitest";
import { PlaylistFormComponent } from "./playlist-form.component";
import { PlaylistService } from "../../data-access/services/playlist.service";
import { PlaylistEntry } from "../../models/playlist.model";

/**
 * Testes unitários para PlaylistFormComponent
 * Mapeados aos requisitos de doc/requisitos_lista_reproducao.md
 *
 * Padrão: Arrange-Act-Assert
 * Todos os testes devem FALHAR inicialmente (métodos/template não implementados).
 */

function createMockPlaylist(overrides: Partial<PlaylistEntry> = {}): PlaylistEntry {
  return {
    id: 1,
    name: "Lista Teste",
    sourceType: "xtream",
    domain: "https://servidor.com",
    username: "user",
    password: "pass",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("PlaylistFormComponent", () => {
  let component: PlaylistFormComponent;
  let fixture: ComponentFixture<PlaylistFormComponent>;
  let mockPlaylistService: {
    getAllPlaylists: ReturnType<typeof vi.fn>;
    getPlaylistById: ReturnType<typeof vi.fn>;
    addPlaylist: ReturnType<typeof vi.fn>;
    updatePlaylist: ReturnType<typeof vi.fn>;
    deletePlaylist: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    mockPlaylistService = {
      getAllPlaylists: vi.fn().mockResolvedValue([]),
      getPlaylistById: vi.fn().mockResolvedValue(undefined),
      addPlaylist: vi.fn().mockResolvedValue(0),
      updatePlaylist: vi.fn().mockResolvedValue(undefined),
      deletePlaylist: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [PlaylistFormComponent, ReactiveFormsModule],
      providers: [
        { provide: PlaylistService, useValue: mockPlaylistService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: (key: string) => null,
            }),
            snapshot: {
              paramMap: { get: (key: string) => null },
            },
          },
        },
        provideRouter([
          { path: "playlists", children: [] },
          { path: "", children: [] },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  // ── Req 3.1: Campos Xtream ───────────────────────────────────────────
  describe("Req 3.1 - Tipo Credenciais Xtream (padrão)", () => {
    it("deve exibir os campos Nome, Domínio, Usuário, Senha e URL do EPG para o tipo Xtream", async () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("xtream");

      // Act
      await fixture.whenStable();
      const nativeEl = fixture.nativeElement;

      // Assert
      expect(nativeEl.querySelector("[data-testid='field-name']")).toBeTruthy();
      expect(nativeEl.querySelector("[data-testid='field-domain']")).toBeTruthy();
      expect(nativeEl.querySelector("[data-testid='field-username']")).toBeTruthy();
      expect(nativeEl.querySelector("[data-testid='field-password']")).toBeTruthy();
      expect(nativeEl.querySelector("[data-testid='field-epg-url']")).toBeTruthy();
    });

    it("não deve exibir os campos URL e Forçar M3U para o tipo Xtream", async () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("xtream");

      // Act
      await fixture.whenStable();
      const nativeEl = fixture.nativeElement;

      // Assert
      expect(nativeEl.querySelector("[data-testid='field-url']")).toBeFalsy();
      expect(nativeEl.querySelector("[data-testid='field-force-m3u']")).toBeFalsy();
    });

    it("deve ter o tipo Xtream como padrão selecionado", () => {
      // Arrange & Act — componente recém-criado

      // Assert
      expect(component.playlistForm.controls.sourceType.value).toBe("xtream");
    });
  });

  // ── Req 3.2: Campos M3U/Xtream URL ──────────────────────────────────
  describe("Req 3.2 - Tipo M3U/Xtream URL", () => {
    it("deve exibir os campos Nome, URL, URL do EPG e Forçar M3U para o tipo M3U", async () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("m3u_url");

      // Act
      component.onSourceTypeChange();
      await fixture.whenStable();
      const nativeEl = fixture.nativeElement;

      // Assert
      expect(nativeEl.querySelector("[data-testid='field-name']")).toBeTruthy();
      expect(nativeEl.querySelector("[data-testid='field-url']")).toBeTruthy();
      expect(nativeEl.querySelector("[data-testid='field-epg-url']")).toBeTruthy();
      expect(nativeEl.querySelector("[data-testid='field-force-m3u']")).toBeTruthy();
    });

    it("não deve exibir os campos Domínio, Usuário e Senha para o tipo M3U", async () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("m3u_url");

      // Act
      component.onSourceTypeChange();
      await fixture.whenStable();
      const nativeEl = fixture.nativeElement;

      // Assert
      expect(nativeEl.querySelector("[data-testid='field-domain']")).toBeFalsy();
      expect(nativeEl.querySelector("[data-testid='field-username']")).toBeFalsy();
      expect(nativeEl.querySelector("[data-testid='field-password']")).toBeFalsy();
    });
  });

  // ── Req 8: Formulário dinâmico ───────────────────────────────────────
  describe("Req 8 - Formulário dinâmico (troca de tipo)", () => {
    it("deve descartar os valores dos campos específicos ao trocar o tipo de fonte", async () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("xtream");
      component.playlistForm.controls.domain.setValue("https://servidor.com");
      component.playlistForm.controls.username.setValue("user");
      component.playlistForm.controls.password.setValue("pass");

      // Act — troca para m3u_url
      component.playlistForm.controls.sourceType.setValue("m3u_url");
      component.onSourceTypeChange();
      await fixture.whenStable();

      // Assert — valores Xtream devem ter sido descartados
      expect(component.playlistForm.controls.domain.value).toBe("");
      expect(component.playlistForm.controls.username.value).toBe("");
      expect(component.playlistForm.controls.password.value).toBe("");
    });

    it("deve descartar os valores de URL e forceM3u ao trocar de M3U para Xtream", async () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("m3u_url");
      component.playlistForm.controls.url.setValue("https://lista.m3u");
      component.playlistForm.controls.forceM3u.setValue(true);

      // Act — troca para xtream
      component.playlistForm.controls.sourceType.setValue("xtream");
      component.onSourceTypeChange();
      await fixture.whenStable();

      // Assert
      expect(component.playlistForm.controls.url.value).toBe("");
      expect(component.playlistForm.controls.forceM3u.value).toBe(false);
    });
  });

  // ── Req 4: Validações ────────────────────────────────────────────────
  describe("Req 4 - Validações", () => {
    it("deve marcar o formulário como inválido se o nome estiver vazio", () => {
      // Arrange
      component.playlistForm.controls.name.setValue("");

      // Act
      component.playlistForm.controls.name.markAsTouched();

      // Assert
      expect(component.playlistForm.controls.name.valid).toBe(false);
      expect(component.playlistForm.controls.name.hasError("required")).toBe(true);
    });

    it("deve marcar o formulário como inválido se o Domínio estiver vazio no tipo Xtream", () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("xtream");
      component.playlistForm.controls.name.setValue("Lista OK");
      component.playlistForm.controls.domain.setValue("");
      component.playlistForm.controls.username.setValue("user");
      component.playlistForm.controls.password.setValue("pass");

      // Act
      component.onSourceTypeChange();

      // Assert
      expect(component.playlistForm.controls.domain.valid).toBe(false);
    });

    it("deve marcar o formulário como inválido se Usuário estiver vazio no tipo Xtream", () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("xtream");
      component.playlistForm.controls.name.setValue("Lista OK");
      component.playlistForm.controls.domain.setValue("https://srv.com");
      component.playlistForm.controls.username.setValue("");
      component.playlistForm.controls.password.setValue("pass");

      // Act
      component.onSourceTypeChange();

      // Assert
      expect(component.playlistForm.controls.username.valid).toBe(false);
    });

    it("deve marcar o formulário como inválido se Senha estiver vazia no tipo Xtream", () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("xtream");
      component.playlistForm.controls.name.setValue("Lista OK");
      component.playlistForm.controls.domain.setValue("https://srv.com");
      component.playlistForm.controls.username.setValue("user");
      component.playlistForm.controls.password.setValue("");

      // Act
      component.onSourceTypeChange();

      // Assert
      expect(component.playlistForm.controls.password.valid).toBe(false);
    });

    it("deve marcar o formulário como inválido se a URL estiver vazia no tipo M3U", () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("m3u_url");
      component.playlistForm.controls.name.setValue("Lista OK");
      component.playlistForm.controls.url.setValue("");

      // Act
      component.onSourceTypeChange();

      // Assert
      expect(component.playlistForm.controls.url.valid).toBe(false);
    });

    it("deve aceitar URL completa com protocolo http no tipo M3U", () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("m3u_url");
      component.playlistForm.controls.url.setValue("http://exemplo.com/lista.m3u");

      // Act
      component.onSourceTypeChange();

      // Assert
      expect(component.playlistForm.controls.url.valid).toBe(true);
    });

    it("deve aceitar URL completa com protocolo https no tipo M3U", () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("m3u_url");
      component.playlistForm.controls.url.setValue("https://exemplo.com/lista.m3u");

      // Act
      component.onSourceTypeChange();

      // Assert
      expect(component.playlistForm.controls.url.valid).toBe(true);
    });

    it("deve aceitar domínio com formato URL completa (https://servidor.com)", () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("xtream");
      component.playlistForm.controls.domain.setValue("https://servidor.com");

      // Act
      component.onSourceTypeChange();

      // Assert
      expect(component.playlistForm.controls.domain.valid).toBe(true);
    });

    it("deve aceitar domínio com formato IP:porta (192.168.1.1:8080)", () => {
      // Arrange
      component.playlistForm.controls.sourceType.setValue("xtream");
      component.playlistForm.controls.domain.setValue("192.168.1.1:8080");

      // Act
      component.onSourceTypeChange();

      // Assert
      expect(component.playlistForm.controls.domain.valid).toBe(true);
    });

    it("deve desabilitar o botão Salvar/Adicionar enquanto o formulário for inválido", async () => {
      // Arrange
      component.playlistForm.controls.name.setValue(""); // Inválido

      // Act
      await fixture.whenStable();
      const submitButton = fixture.nativeElement.querySelector("[data-testid='submit-button']");

      // Assert
      expect(component.playlistForm.invalid).toBe(true);
      expect(submitButton?.disabled).toBe(true);
    });
  });

  // ── Req 6: Data de Expiração ─────────────────────────────────────────
  describe("Req 6 - Data de Expiração", () => {
    it("não deve exibir campo para edição da data de expiração no formulário", async () => {
      // Arrange & Act
      await fixture.whenStable();
      const nativeEl = fixture.nativeElement;
      const expiresAtInput = nativeEl.querySelector("[data-testid='field-expires-at']");

      // Assert
      expect(expiresAtInput).toBeFalsy();
    });
  });

  // ── Req 5: Ações de Navegação e Controle ─────────────────────────────
  describe("Req 5 - Ações de Navegação e Controle", () => {
    it("deve chamar addPlaylist do service ao salvar uma nova playlist (modo adição)", async () => {
      // Arrange
      mockPlaylistService.addPlaylist.mockResolvedValue(1);
      const navigateSpy = vi.spyOn(router, "navigate");
      component.isEditMode.set(false);
      component.playlistForm.controls.name.setValue("Nova Lista");
      component.playlistForm.controls.sourceType.setValue("xtream");
      component.playlistForm.controls.domain.setValue("https://srv.com");
      component.playlistForm.controls.username.setValue("u");
      component.playlistForm.controls.password.setValue("p");

      // Act
      component.save();
      await fixture.whenStable();

      // Assert
      expect(mockPlaylistService.addPlaylist).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalled();
    });

    it("deve chamar updatePlaylist do service ao salvar uma playlist existente (modo edição)", async () => {
      // Arrange
      mockPlaylistService.updatePlaylist.mockResolvedValue(undefined);
      const navigateSpy = vi.spyOn(router, "navigate");
      component.isEditMode.set(true);
      component.playlistId.set(1);
      component.playlistForm.controls.name.setValue("Lista Editada");
      component.playlistForm.controls.sourceType.setValue("xtream");
      component.playlistForm.controls.domain.setValue("https://novo.com");
      component.playlistForm.controls.username.setValue("u");
      component.playlistForm.controls.password.setValue("p");

      // Act
      component.save();
      await fixture.whenStable();

      // Assert
      expect(mockPlaylistService.updatePlaylist).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ name: "Lista Editada" }),
      );
      expect(navigateSpy).toHaveBeenCalled();
    });

    it("deve retornar para a listagem ao clicar em Cancelar sem gravar", async () => {
      // Arrange
      const navigateSpy = vi.spyOn(router, "navigate");
      component.playlistForm.controls.name.setValue("Dados descartáveis");

      // Act
      component.cancel();
      await fixture.whenStable();

      // Assert
      expect(mockPlaylistService.addPlaylist).not.toHaveBeenCalled();
      expect(mockPlaylistService.updatePlaylist).not.toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalled();
    });

    it("deve fechar a tela de gerenciamento ao clicar em Sair", async () => {
      // Arrange
      const navigateSpy = vi.spyOn(router, "navigate");

      // Act
      const nativeEl = fixture.nativeElement;
      const exitButton = nativeEl.querySelector("[data-testid='exit-button']");
      exitButton?.click();
      await fixture.whenStable();

      // Assert
      // Assumindo que "Sair" navega para fora da rota atual ou aciona router.navigate
      expect(navigateSpy).toHaveBeenCalled();
    });
  });

  // ── Req 2: Edição (carregar dados) ───────────────────────────────────
  describe("Req 2 - Edição (carregamento de dados)", () => {
    it("deve carregar dados da playlist existente para o formulário no modo edição", async () => {
      // Arrange
      const existing = createMockPlaylist({
        id: 5,
        name: "Lista Existente",
        sourceType: "xtream",
        domain: "https://existente.com",
        username: "admin",
        password: "admin123",
        epgUrl: "https://epg.existente.com",
      });
      mockPlaylistService.getPlaylistById.mockResolvedValue(existing);

      // Act
      component.loadPlaylist(5);
      await fixture.whenStable();

      // Assert
      expect(component.isEditMode()).toBe(true);
      expect(component.playlistForm.controls.name.value).toBe("Lista Existente");
      expect(component.playlistForm.controls.domain.value).toBe("https://existente.com");
      expect(component.playlistForm.controls.username.value).toBe("admin");
    });
  });

  // ── Req 7: Estado de Loading ─────────────────────────────────────────
  describe("Req 7 - Estado de Loading no formulário", () => {
    it("deve exibir indicador de loading ao salvar", async () => {
      // Arrange
      let resolveSave!: (value: number) => void;
      mockPlaylistService.addPlaylist.mockReturnValue(
        new Promise((resolve) => {
          resolveSave = resolve;
        }),
      );
      component.isEditMode.set(false);
      component.playlistForm.controls.name.setValue("Lista");
      component.playlistForm.controls.sourceType.setValue("xtream");
      component.playlistForm.controls.domain.setValue("https://srv.com");
      component.playlistForm.controls.username.setValue("u");
      component.playlistForm.controls.password.setValue("p");

      // Act
      component.save();

      // Assert
      expect(component.isLoading()).toBe(true);

      // Cleanup
      resolveSave(1);
      await fixture.whenStable();
    });
  });

  // ── Req 4: Nome duplicado (validação inline) ─────────────────────────
  describe("Req 4 - Validação de nome duplicado (inline)", () => {
    it("deve exibir erro inline quando o nome já existe no banco", async () => {
      // Arrange
      const existingPlaylists = [createMockPlaylist({ id: 1, name: "Nome Já Usado" })];
      mockPlaylistService.getAllPlaylists.mockResolvedValue(existingPlaylists);
      component.playlistForm.controls.name.setValue("Nome Já Usado");

      // Act
      component.playlistForm.controls.name.markAsTouched();
      await fixture.whenStable();
      const nameError = fixture.nativeElement.querySelector("[data-testid='error-name-duplicate']");

      // Assert
      expect(component.playlistForm.controls.name.hasError("duplicateName")).toBe(true);
      expect(nameError).toBeTruthy();
    });
  });
});
