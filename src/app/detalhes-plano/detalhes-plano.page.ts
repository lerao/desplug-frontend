import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of, startWith, switchMap, combineLatest, forkJoin, BehaviorSubject } from 'rxjs';
import { PlanoAulaService, PlanoAula, FeedbackPratico, FeedbackPraticoRequest } from '../services/plano-aula.service';
import { AuthService } from '../services/auth.service';
import { AppDialogService } from "../shared/app-dialog/app-dialog.service";

interface DetalhesPlano { plano: PlanoAula | null; feedbacks: FeedbackPratico[]; carregando: boolean; }

@Component({
  selector: 'app-detalhes-plano',
  templateUrl: './detalhes-plano.page.html',
  styleUrls: ['./detalhes-plano.page.scss'],
  standalone: false,
})
export class DetalhesPlanoPage {

  private readonly route = inject(ActivatedRoute);
  private readonly planoAulaService = inject(PlanoAulaService);
  private readonly authService = inject(AuthService);
  private readonly appDialog = inject(AppDialogService);
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  readonly status$ = combineLatest([
    this.route.paramMap,
    this.reload$
  ]).pipe(
    switchMap(([params]) => {

      const id = Number(params.get('id'));

      if (!Number.isInteger(id) || id <= 0) {
        return of<DetalhesPlano>({
          plano: null,
          feedbacks: [],
          carregando: false
        });
      }

      return forkJoin({

        plano: this.planoAulaService.getPlanoPorId(id).pipe(
          catchError(erro => {
            console.error('Erro ao carregar detalhes do plano:', erro);
            return of(null);
          })
        ),

        feedbacks: this.planoAulaService.getFeedbacksPorPlano(id).pipe(
          catchError(erro => {
            console.error('Erro ao carregar comentários:', erro);
            return of([]);
          })
        )

      }).pipe(
        map(({ plano, feedbacks }): DetalhesPlano => ({
          plano,
          feedbacks,
          carregando: false
        })),

        startWith({ plano: null, feedbacks: [], carregando: true } as DetalhesPlano)
      );
    })
  );

  accountNoticeVisible = false;
  usuarioLogado = !!this.authService.sessaoAtual();

  // estados do formulário de comentários
  exibirFormFeedback = false;
  isSubmetendoFeedback = false;
  idComentario: number | null = null;
  dataAplicacaoEmEdicao: string | undefined;

  salvarFeedback = {
    avaliacaoGeral: 0,
    relatoExperiencia: ''
  };

  showAccountNotice(): void {
    this.accountNoticeVisible = true;
  }

  // abrir ou fechar o formulário para novo comentário
  alternarFormFeedback(): void {
    if (this.exibirFormFeedback) {
      this.cancelarFormulario();
      return;
    }

    this.idComentario = null;
    this.salvarFeedback = {
      avaliacaoGeral: 0,
      relatoExperiencia: ''
    };

    this.exibirFormFeedback = true;
  }

  cancelarFormulario(): void {
    this.exibirFormFeedback = false;
    this.idComentario = null;
    this.dataAplicacaoEmEdicao = undefined;
    this.salvarFeedback = {
      avaliacaoGeral: 0,
      relatoExperiencia: ''
    };
  }

  // verifica se o comentário pertence ao usuário logado
  isFeedbackUsuario(feedback: FeedbackPratico): boolean {
    const sessao = this.authService.sessaoAtual();
    return !!sessao && feedback.usuario?.id === sessao.usuarioId;
  }

  editarFeedback(feedback: FeedbackPratico): void {
    if (!this.isFeedbackUsuario(feedback)) {
      return;
    }

    this.idComentario = feedback.id;
    this.dataAplicacaoEmEdicao = feedback.dataAplicacao;

    this.salvarFeedback = {
      avaliacaoGeral: feedback.avaliacaoGeral,
      relatoExperiencia: feedback.relatoExperiencia
    };

    this.exibirFormFeedback = true;
  }

  setAvaliacao(nota: number): void {
    this.salvarFeedback.avaliacaoGeral = nota;
  }

  // publica um comentário novo ou atualizar um existente
  salvarComentario(planoId: number): void {
    if (!this.authService.sessaoAtual()) {
      return;
    }

    const { avaliacaoGeral, relatoExperiencia } = this.salvarFeedback;

    if (!avaliacaoGeral || !relatoExperiencia.trim()) {
      return;
    }

    const payload: FeedbackPraticoRequest = {
      relatoExperiencia: relatoExperiencia.trim(),
      avaliacaoGeral,
      dataAplicacao: this.dataAplicacaoEmEdicao ||
        new Date().toISOString().split('.')[0] + 'Z',
      plano: { id: planoId }
    };

    this.isSubmetendoFeedback = true;

    // se existe um id, é edição
    if (this.idComentario !== null) {
      this.planoAulaService.atualizarFeedback(
        this.idComentario,
        payload
      ).subscribe({
        next: () => {
          this.isSubmetendoFeedback = false;
          this.cancelarFormulario();
          this.reload$.next();

          void this.appDialog.alert(
            'Comentário atualizado com sucesso.',
            'Sucesso!'
          );
        },
        error: erro => {
          console.error('Erro ao atualizar comentário:', erro);
          this.isSubmetendoFeedback = false;

          void this.appDialog.alert(
            'Não foi possível atualizar o comentário. Tente novamente.',
            'Ops!'
          );
        }
      });

      return;
    }

    // caso contrário, é um novo comentário
    this.planoAulaService.criarFeedback(payload).subscribe({
      next: () => {
        this.isSubmetendoFeedback = false;
        this.cancelarFormulario();
        this.reload$.next();

        void this.appDialog.alert(
          'Comentário publicado com sucesso.',
          'Sucesso!'
        );
      },
      error: erro => {
        console.error('Erro ao publicar comentário:', erro);
        this.isSubmetendoFeedback = false;

        void this.appDialog.alert(
          'Não foi possível publicar o comentário. Tente novamente.',
          'Ops!'
        );
      }
    });
  }


  // solicita confirmação antes de excluir
  async excluirFeedback(feedback: FeedbackPratico): Promise<void> {
    if (!this.isFeedbackUsuario(feedback)) {
      return;
    }

    const { role } = await this.appDialog.confirm({
      title: 'Excluir comentário',
      message: 'Tem certeza de que deseja excluir este comentário? Essa ação não poderá ser desfeita.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Excluir', role: 'destructive' }
      ]
    });

    if (role === 'destructive') {
      this.confirmarExclusaoFeedback(feedback.id);
    }
  }


  // executa a exclusão após a confirmação
  private confirmarExclusaoFeedback(id: number): void {
    this.planoAulaService.excluirFeedback(id).subscribe({
      next: () => {
        // se o comentário excluído estava sendo editado, fechar o formulário
        if (this.idComentario === id) {
          this.cancelarFormulario();
        }

        this.reload$.next();

        void this.appDialog.alert(
          'Comentário excluído com sucesso.',
          'Sucesso!'
        );
      },
      error: erro => {
        console.error('Erro ao excluir comentário:', erro);

        void this.appDialog.alert(
          'Não foi possível excluir o comentário. Tente novamente.',
          'Ops!'
        );
      }
    });
  }

  getIniciaisNome(nome: string): string {
    return this.planoAulaService.getAutorIniciais(nome);
  }
}