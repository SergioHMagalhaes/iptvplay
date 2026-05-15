import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { vi } from "vitest";
import { PlaylistListComponent } from "./playlist-list.component";
import { PlaylistService } from "../../../../core/services/playlist.service";
import { PlaylistEntry } from "../../../../core/models/playlist.model";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { PlaylistSyncService } from "../../../../core/services/playlist-sync.service";

/**
 * Testes unitários para PlaylistListComponent
 * Mapeados aos requisitos de doc/requisitos_lista_reproducao.md
 *
 * Padrão: Arrange-Act-Assert
 * Todos os testes devem FALHAR inicialmente (métodos/template não implementados).
 */

function createMockPlaylist(overrides: Partial<PlaylistEntry> = {}): PlaylistEntry {
  return {
    id: 1,
    name: "Lista 1",
    sourceType: "xtream",
    domain: "https://servidor.com",
    username: "user",
    password: "pass",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("PlaylistListComponent", () => {
  let component: PlaylistListComponent;
  let fixture: ComponentFixture<PlaylistListComponent>;
  let mockPlaylistService: {
    getAllPlaylists: ReturnType<typeof vi.fn>;
    getPlaylistById: ReturnType<typeof vi.fn>;
    addPlaylist: ReturnType<typeof vi.fn>;
    updatePlaylist: ReturnType<typeof vi.fn>;
    deletePlaylist: ReturnType<typeof vi.fn>;
  };
  let mockSelectedPlaylistService: {
    getSelectedPlaylistId: ReturnType<typeof vi.fn>;
    selectPlaylist: ReturnType<typeof vi.fn>;
  };
  let mockPlaylistSyncService: { syncPlaylist: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    mockPlaylistService = {
      getAllPlaylists: vi.fn().mockResolvedValue([]),
      getPlaylistById: vi.fn().mockResolvedValue(undefined),
      addPlaylist: vi.fn().mockResolvedValue(0),
      updatePlaylist: vi.fn().mockResolvedValue(undefined),
      deletePlaylist: vi.fn().mockResolvedValue(undefined),
    };
    mockSelectedPlaylistService = {
      getSelectedPlaylistId: vi.fn().mockResolvedValue(null),
      selectPlaylist: vi.fn().mockResolvedValue(undefined),
    };
    mockPlaylistSyncService = {
      syncPlaylist: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [PlaylistListComponent],
      providers: [
        { provide: PlaylistService, useValue: mockPlaylistService },
        { provide: SelectedPlaylistService, useValue: mockSelectedPlaylistService },
        { provide: PlaylistSyncService, useValue: mockPlaylistSyncService },
        provideRouter([
          {
            path: "playlists",
            children: [
              { path: "new", children: [] },
              { path: "edit/:id", children: [] },
            ],
          },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  // ── Req 2: Listagem ──────────────────────────────────────────────────
  describe("Req 2 - Listagem de playlists", () => {
    it("deve carregar e exibir as listas cadastradas ao inicializar", async () => {
      // Arrange
      const mockPlaylists: PlaylistEntry[] = [
        createMockPlaylist({ id: 1, name: "Lista 1" }),
        createMockPlaylist({ id: 2, name: "Lista 2" }),
      ];
      mockPlaylistService.getAllPlaylists.mockResolvedValue(mockPlaylists);

      // Act
      component.ngOnInit();
      await fixture.whenStable();

      // Assert
      expect(mockPlaylistService.getAllPlaylists).toHaveBeenCalled();
      expect(component.playlists().length).toBe(2);
    });

    it("deve exibir os cards das listas na tela", async () => {
      // Arrange
      const mockPlaylists: PlaylistEntry[] = [
        createMockPlaylist({ id: 1, name: "Lista 1" }),
        createMockPlaylist({ id: 2, name: "Lista 2" }),
      ];
      mockPlaylistService.getAllPlaylists.mockResolvedValue(mockPlaylists);

      // Act
      component.ngOnInit();
      await fixture.whenStable();
      const cards = fixture.nativeElement.querySelectorAll("[data-testid='playlist-card']");

      // Assert
      expect(cards.length).toBe(2);
    });

    it("deve exibir a data de expiração no card quando disponível (Req 6)", async () => {
      // Arrange
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const mockPlaylists: PlaylistEntry[] = [createMockPlaylist({ id: 1, name: "Lista 1", expiresAt })];
      mockPlaylistService.getAllPlaylists.mockResolvedValue(mockPlaylists);

      // Act
      component.ngOnInit();
      await fixture.whenStable();
      const expiryEl = fixture.nativeElement.querySelector("[data-testid='playlist-expiry']");

      // Assert
      expect(expiryEl).toBeTruthy();
      expect(expiryEl.textContent).toBeTruthy();
    });
  });

  describe("Seleção da playlist ativa", () => {
    it("restaura a playlist selecionada ao inicializar", async () => {
      mockPlaylistService.getAllPlaylists.mockResolvedValue([createMockPlaylist({ id: 1 })]);
      mockSelectedPlaylistService.getSelectedPlaylistId.mockResolvedValue(1);

      component.ngOnInit();
      await fixture.whenStable();

      expect(component.selectedPlaylistId()).toBe(1);
    });

    it("permite selecionar a playlist que será usada pelo player e sincroniza o conteúdo", async () => {
      const playlist = createMockPlaylist({ id: 1 });

      await component.selectForPlayer(playlist);

      expect(mockSelectedPlaylistService.selectPlaylist).toHaveBeenCalledWith(1);
      expect(mockPlaylistSyncService.syncPlaylist).toHaveBeenCalledWith(playlist);
      expect(component.selectedPlaylistId()).toBe(1);
    });

    it("exibe estado de sincronização durante a seleção", async () => {
      const playlist = createMockPlaylist({ id: 1 });
      let resolveSync!: () => void;
      mockPlaylistSyncService.syncPlaylist.mockReturnValue(
        new Promise<void>((resolve) => {
          resolveSync = resolve;
        }),
      );

      const promise = component.selectForPlayer(playlist);

      expect(component.syncingPlaylistId()).toBe(1);

      resolveSync();
      await promise;
      expect(component.syncingPlaylistId()).toBeNull();
    });

    it("expõe erro de sincronização quando a atualização local falha", async () => {
      const playlist = createMockPlaylist({ id: 1 });
      mockPlaylistSyncService.syncPlaylist.mockRejectedValue(new Error("Falha no Xtream"));

      await component.selectForPlayer(playlist);

      expect(component.syncErrorMessage()).toContain("Falha no Xtream");
    });
  });

  // ── Req 2: Empty State ───────────────────────────────────────────────
  describe("Req 2 - Empty state", () => {
    it("deve exibir mensagem informativa quando não há listas cadastradas", async () => {
      // Arrange
      mockPlaylistService.getAllPlaylists.mockResolvedValue([]);

      // Act
      component.ngOnInit();
      await fixture.whenStable();
      const emptyState = fixture.nativeElement.querySelector("[data-testid='empty-state']");

      // Assert
      expect(emptyState).toBeTruthy();
    });

    it("deve exibir um atalho para adicionar a primeira lista no empty state", async () => {
      // Arrange
      mockPlaylistService.getAllPlaylists.mockResolvedValue([]);

      // Act
      component.ngOnInit();
      await fixture.whenStable();
      const addButton = fixture.nativeElement.querySelector("[data-testid='empty-state-add-button']");

      // Assert
      expect(addButton).toBeTruthy();
    });
  });

  // ── Req 2: Menu de contexto ──────────────────────────────────────────
  describe("Req 2 - Menu de contexto", () => {
    it("deve exibir um ícone de menu de contexto (...) em cada card", async () => {
      // Arrange
      const mockPlaylists: PlaylistEntry[] = [createMockPlaylist({ id: 1, name: "Lista 1" })];
      mockPlaylistService.getAllPlaylists.mockResolvedValue(mockPlaylists);

      // Act
      component.ngOnInit();
      await fixture.whenStable();
      const menuButton = fixture.nativeElement.querySelector("[data-testid='context-menu-button']");

      // Assert
      expect(menuButton).toBeTruthy();
    });

    it("deve exibir opções Editar e Excluir ao acionar o menu de contexto", async () => {
      // Arrange
      const mockPlaylists: PlaylistEntry[] = [createMockPlaylist({ id: 1, name: "Lista 1" })];
      mockPlaylistService.getAllPlaylists.mockResolvedValue(mockPlaylists);

      // Act
      component.ngOnInit();
      await fixture.whenStable();
      const menuButton = fixture.nativeElement.querySelector("[data-testid='context-menu-button']");
      menuButton?.click();
      await fixture.whenStable();

      const editOption = fixture.nativeElement.querySelector("[data-testid='menu-edit']");
      const deleteOption = fixture.nativeElement.querySelector("[data-testid='menu-delete']");

      // Assert
      expect(editOption).toBeTruthy();
      expect(deleteOption).toBeTruthy();
    });
  });

  // ── Req 5: Navegação - Adicionar ─────────────────────────────────────
  describe("Req 5 - Navegação", () => {
    it("deve navegar para a tela de adição ao clicar em Adicionar", async () => {
      // Arrange
      const navigateSpy = vi.spyOn(router, "navigate");

      // Act
      component.navigateToAdd();

      // Assert
      expect(navigateSpy).toHaveBeenCalled();
    });

    it("deve navegar para a tela de edição ao clicar em Editar (card ou menu)", async () => {
      // Arrange
      const navigateSpy = vi.spyOn(router, "navigate");

      // Act
      component.navigateToEdit(1);

      // Assert
      expect(navigateSpy).toHaveBeenCalled();
    });
  });

  // ── Req 2: Exclusão com confirmação (Req 7) ─────────────────────────
  describe("Req 2 / Req 7 - Exclusão com confirmação", () => {
    it("deve chamar o serviço de exclusão após confirmação", async () => {
      // Arrange
      mockPlaylistService.deletePlaylist.mockResolvedValue(undefined);
      mockPlaylistService.getAllPlaylists.mockResolvedValue([]);

      // Act
      component.confirmDelete(1);
      await fixture.whenStable();

      // Assert
      expect(mockPlaylistService.deletePlaylist).toHaveBeenCalledWith(1);
    });

    it("deve remover a playlist da lista após exclusão bem-sucedida", async () => {
      // Arrange
      const mockPlaylists: PlaylistEntry[] = [
        createMockPlaylist({ id: 1, name: "Lista 1" }),
        createMockPlaylist({ id: 2, name: "Lista 2" }),
      ];
      mockPlaylistService.getAllPlaylists
        .mockResolvedValueOnce(mockPlaylists)
        .mockResolvedValueOnce([mockPlaylists[1]]);
      mockPlaylistService.deletePlaylist.mockResolvedValue(undefined);
      component.ngOnInit();
      await fixture.whenStable();

      // Act
      component.confirmDelete(1);
      await fixture.whenStable();

      // Assert
      expect(component.playlists().length).toBe(1);
      expect(component.playlists()[0].name).toBe("Lista 2");
    });
  });

  // ── Req 7: Estados de UI ─────────────────────────────────────────────
  describe("Req 7 - Estados de UI", () => {
    it("deve exibir indicador de carregamento durante operações assíncronas (loading)", async () => {
      // Arrange
      let resolveGetAll!: (value: PlaylistEntry[]) => void;
      mockPlaylistService.getAllPlaylists.mockReturnValue(
        new Promise((resolve) => {
          resolveGetAll = resolve;
        }),
      );

      // Act
      component.ngOnInit();

      // Assert — loading deve estar ativo enquanto a Promise não resolveu
      expect(component.isLoading()).toBe(true);

      // Cleanup
      resolveGetAll([]);
      await fixture.whenStable();
    });

    it("deve desativar o loading após a listagem ser carregada", async () => {
      // Arrange
      mockPlaylistService.getAllPlaylists.mockResolvedValue([]);

      // Act
      component.ngOnInit();
      await fixture.whenStable();

      // Assert
      expect(component.isLoading()).toBe(false);
    });

    it("deve exibir mensagem de erro se o serviço falhar (erro de persistência)", async () => {
      // Arrange
      mockPlaylistService.getAllPlaylists.mockRejectedValue(new Error("IndexedDB não disponível"));

      // Act
      component.ngOnInit();
      await fixture.whenStable();

      // Assert
      expect(component.errorMessage()).toBeTruthy();
      expect(component.errorMessage()).toContain("IndexedDB");
    });
  });

  // ── Req 2: Edição via card ───────────────────────────────────────────
  describe("Req 2 - Edição pelo card", () => {
    it("deve navegar para edição ao clicar em qualquer área do card (exceto menu)", async () => {
      // Arrange
      const mockPlaylists: PlaylistEntry[] = [createMockPlaylist({ id: 1, name: "Lista 1" })];
      mockPlaylistService.getAllPlaylists.mockResolvedValue(mockPlaylists);
      const navigateSpy = vi.spyOn(router, "navigate");
      component.ngOnInit();
      await fixture.whenStable();

      // Act
      const card = fixture.nativeElement.querySelector("[data-testid='playlist-card']");
      card?.click();
      await fixture.whenStable();

      // Assert
      expect(navigateSpy).toHaveBeenCalled();
    });

    it("não deve navegar para edição ao clicar no botão do menu de contexto (stopPropagation)", async () => {
      // Arrange
      const mockPlaylists: PlaylistEntry[] = [createMockPlaylist({ id: 1, name: "Lista 1" })];
      mockPlaylistService.getAllPlaylists.mockResolvedValue(mockPlaylists);
      const navigateSpy = vi.spyOn(router, "navigate");
      component.ngOnInit();
      await fixture.whenStable();

      // Act
      const menuButton = fixture.nativeElement.querySelector("[data-testid='context-menu-button']");

      const event = new MouseEvent("click");
      const stopPropagationSpy = vi.spyOn(event, "stopPropagation");
      menuButton?.dispatchEvent(event);
      await fixture.whenStable();

      // Assert
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });
});
