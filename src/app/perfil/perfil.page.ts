import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PerfilService } from '../services/perfil.service';
import { AuthService } from '../services/auth.service';
import { PerfilDados, PerfilErros } from '../models/perfil.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage implements OnInit {
  private perfilService = inject(PerfilService);
  private authService = inject(AuthService);

  private initialSnapshot = '';

  readonly name = signal('');
  readonly email = signal('');
  readonly photo = signal<string | null>(null);
  readonly role = signal<'professor' | 'admin'>('professor');
  readonly errors = signal<PerfilErros>({});
  readonly saved = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly passwordSaving = signal(false);
  readonly passwordError = signal('');
  readonly passwordSaved = signal(false);

  readonly isAdmin = computed(() => this.role() === 'admin');
  readonly roleLabel = computed(() => this.isAdmin() ? 'Administrador' : 'Professor');
  readonly dirty = computed(() => this.currentSnapshot() !== this.initialSnapshot);

  ngOnInit(): void {
    this.carregarPerfil();
  }

  previewInitials(): string {
    const initials = this.name()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toLocaleUpperCase('pt-BR'))
      .join('');

    return initials || 'US';
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errors.update((errors) => ({ ...errors, photo: 'Selecione um arquivo de imagem válido.' }));
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errors.update((errors) => ({ ...errors, photo: 'A imagem deve ter no máximo 5 MB.' }));
      input.value = '';
      return;
    }

    this.saving.set(true);
    this.clearError('photo');

    this.perfilService.uploadFoto(file).subscribe({
      next: (response) => {
        this.photo.set(response.photo);
        this.authService.updateStoredUser({ photo: response.photo });
        this.initialSnapshot = this.currentSnapshot();
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => {
        this.errors.update((errors) => ({ ...errors, photo: 'Não foi possível enviar a foto. Tente novamente.' }));
        this.saving.set(false);
      },
    });

    input.value = '';
  }

  removePhoto(): void {
    this.saving.set(true);
    this.clearError('photo');

    this.perfilService.removerFoto().subscribe({
      next: () => {
        this.photo.set(null);
        this.authService.updateStoredUser({ photo: null });
        this.initialSnapshot = this.currentSnapshot();
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => {
        this.errors.update((errors) => ({ ...errors, photo: 'Não foi possível remover a foto. Tente novamente.' }));
        this.saving.set(false);
      },
    });
  }

  save(): void {
    const errors = this.validate();
    this.errors.set(errors);
    if (Object.keys(errors).length > 0) return;

    this.saving.set(true);
    this.errorMessage.set('');

    const dados = { name: this.name().trim(), email: this.email().trim() };

    this.perfilService.atualizarPerfil(dados).subscribe({
      next: (perfil) => {
        this.name.set(perfil.name);
        this.email.set(perfil.email);
        this.authService.updateStoredUser({ name: perfil.name, email: perfil.email });
        this.initialSnapshot = this.currentSnapshot();
        this.saving.set(false);
        this.saved.set(true);
      },
      error: (err) => {
        this.saving.set(false);
        if (err.status === 409) {
          this.errors.update((errors) => ({ ...errors, email: 'Este e-mail já está em uso.' }));
        } else if (err.status === 0) {
          this.errorMessage.set('Não foi possível conectar ao servidor.');
        } else {
          this.errorMessage.set('Ocorreu um erro ao salvar. Tente novamente.');
        }
      },
    });
  }

  changePassword(): void {
    this.passwordError.set('');
    this.passwordSaved.set(false);
    const current = this.currentPassword();
    const next = this.newPassword();

    if (!current || !next || !this.confirmPassword()) {
      this.passwordError.set('Preencha todos os campos de senha.');
      return;
    }
    if (next.length < 8) {
      this.passwordError.set('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (next !== this.confirmPassword()) {
      this.passwordError.set('A confirmação não corresponde à nova senha.');
      return;
    }
    if (current === next) {
      this.passwordError.set('Escolha uma senha diferente da atual.');
      return;
    }

    this.passwordSaving.set(true);
    this.perfilService.atualizarSenha(current, next).subscribe({
      next: () => {
        this.currentPassword.set('');
        this.newPassword.set('');
        this.confirmPassword.set('');
        this.passwordSaving.set(false);
        this.passwordSaved.set(true);
      },
      error: (err) => {
        this.passwordSaving.set(false);
        if (err.status === 400 || err.status === 401) {
          this.passwordError.set('A senha atual está incorreta ou não foi aceita.');
        } else if (err.status === 0) {
          this.passwordError.set('Não foi possível conectar ao servidor. Tente novamente.');
        } else {
          this.passwordError.set('Não foi possível alterar a senha. Tente novamente.');
        }
      },
    });
  }

  discard(): void {
    this.carregarPerfil();
  }

  private carregarPerfil(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.perfilService.getPerfil().subscribe({
      next: (perfil) => {
        this.name.set(perfil.name);
        this.email.set(perfil.email);
        this.photo.set(perfil.photo);
        this.role.set(perfil.role);
        this.errors.set({});
        this.saved.set(false);
        this.initialSnapshot = this.currentSnapshot();
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 0) {
          this.errorMessage.set('Não foi possível conectar ao servidor.');
        } else {
          this.errorMessage.set('Não foi possível carregar os dados do perfil.');
        }
      },
    });
  }

  private validate(): PerfilErros {
    const errors: PerfilErros = {};
    const name = this.name().trim();
    const email = this.email().trim();

    if (!name) {
      errors.name = 'Informe seu nome completo.';
    }

    if (!email) {
      errors.email = 'Informe seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Informe um endereço de e-mail válido.';
    } else if (!this.isAdmin() && !email.toLocaleLowerCase('pt-BR').endsWith('.br')) {
      errors.email = 'O e-mail deve terminar com .br.';
    }

    return errors;
  }

  private getCurrentProfile(): PerfilDados {
    return {
      name: this.name().trim(),
      email: this.email().trim(),
      photo: this.photo(),
      role: this.role(),
    };
  }

  private currentSnapshot(): string {
    return JSON.stringify(this.getCurrentProfile());
  }

  private clearError(field: keyof PerfilErros): void {
    this.errors.update((errors) => {
      const next = { ...errors };
      delete next[field];
      return next;
    });
  }
}
