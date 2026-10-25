import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { PlanoAulaService, PlanoAulaRequest, HabilidadeBncc, TipoAtividade, EtapaEnsino } from '../services/plano-aula.service';
import { AlertController } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-plano-aula',
  templateUrl: './plano-aula.page.html',
  styleUrls: ['./plano-aula.page.scss'],
  standalone: false,
})
export class PlanoAulaPage implements OnInit {

  planoForm!: FormGroup;
  etapaAtual: number = 1;
  totalEtapas: number = 4;

  salvando: boolean = false;
  habilidadesSelecionadas: number[] = [];

  autorIdTeste: number | null = 2;

  etapasTitulos: Record<number, string> = {
    1: 'Identificação',
    2: 'Classificação',
    3: 'Conteúdo',
    4: 'BNCC & Publicação'
  };

  bnccHab: {
    id: number;
    code: string;
    tag: string;
    desc: string;
    componenteCurricular: string;
  }[] = [];

  constructor(
    private fb: FormBuilder,
    private planoAulaApi: PlanoAulaService,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    this.planoForm = this.fb.group({
      titulo: ['', Validators.required],
      resumo: ['', Validators.required],
      imagem_capa: [''],
      tipo_atividade: ['', Validators.required],
      etapa_ensino: ['', Validators.required],
      anos_indicados: ['', Validators.required],
      duracao_estimada: ['', Validators.required],
      componentes_curriculares: [''],
      metodologia: ['', Validators.required],
      materiais_necessarios: ['', Validators.required],
      criterios_avaliacao: ['', Validators.required]
    });

    this.carregarHabilidades();
  }

  carregarHabilidades() {
    this.planoAulaApi.listarHabilidades().subscribe({
      next: (habilidades: HabilidadeBncc[]) => {
        console.log('Habilidades BNCC carregadas:', habilidades);
        this.bnccHab = habilidades.map(hab => ({
          id: hab.id,
          code: hab.codigo,
          tag: hab.eixoComputacao,
          desc: hab.descricao,
          componenteCurricular: hab.componenteCurricular
        }));
      },

      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar habilidades BNCC:', erro);
      }
    });
  }

  marcarHabilidade(id: number, selecionada: boolean) {
    if (selecionada) {
      if (!this.habilidadesSelecionadas.includes(id)) {
        this.habilidadesSelecionadas.push(id);
      }
    } else {
      this.habilidadesSelecionadas =
        this.habilidadesSelecionadas.filter(
          habilidadeId => habilidadeId !== id
        );
    }
  }

  camposInvalidos(field: string): boolean {
    const control = this.planoForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  proxEtapa() {
    if (!this.validarEtapaAtual()) {
      return;
    }

    if (this.etapaAtual < this.totalEtapas) {
      this.etapaAtual++;
    } else {
      this.publicarPlano();
    }
  }

  prevEtapa() {
    if (this.etapaAtual > 1) {
      this.etapaAtual--;
    }
  }

  async publicarPlano() {

    if (this.planoForm.invalid) {
      this.planoForm.markAllAsTouched();
      return;
    }

    if (this.habilidadesSelecionadas.length === 0) {
      await this.exibirMensagem(
        'Atenção',
        'Selecione pelo menos uma habilidade BNCC.'
      );
      return;
    }

    if (this.autorIdTeste === null) {
      await this.exibirMensagem(
        'Atenção',
        'É necessário informar um autor de teste para cadastrar o plano.'
      );
      return;
    }

    if (this.salvando) return;

    const valores = this.planoForm.value;

    const tipos: Record<string, TipoAtividade> = {
      plano_aula: 'PLANO_AULA',
      desplugada: 'ATIVIDADE_DESPLUGADA',
      maker: 'PROJETO_MAKER',
      digital: 'ATIVIDADE_DIGITAL'
    };

    const etapas: Record<string, EtapaEnsino> = {
      infantil: 'EDUCACAO_INFANTIL',
      fundamental1: 'FUNDAMENTAL_INICIAIS',
      fundamental2: 'FUNDAMENTAL_FINAIS',
      medio: 'ENSINO_MEDIO'
    };

    const componentesCurriculares = [
      ...new Set(
        this.bnccHab
          .filter(hab =>
            this.habilidadesSelecionadas.includes(hab.id)
          )
          .map(hab => hab.componenteCurricular?.trim())
          .filter((nome): nome is string => !!nome)
      )
    ].join(', ');

    if (!componentesCurriculares) {
      await this.exibirMensagem(
        'Atenção',
        'As habilidades selecionadas não possuem componentes curriculares cadastrados.'
      );
      return;
    }

    const dadosPlano: PlanoAulaRequest = {
      titulo: valores.titulo,
      resumo: valores.resumo,
      tipoAtividade: tipos[valores.tipo_atividade],
      etapaEnsino: etapas[valores.etapa_ensino],
      anosIndicados: valores.anos_indicados,
      duracao: valores.duracao_estimada,
      componentesCurriculares: componentesCurriculares,
      materiaisNecessarios: valores.materiais_necessarios,
      metodologia: valores.metodologia,
      criteriosAvaliacao: valores.criterios_avaliacao,

      // Upload ainda não integrado
      imagemCapa: '',

      habilidadesPlano: this.habilidadesSelecionadas.map(
        id => ({
          habilidade: { id }
        })
      ),

      autor: {
        id: this.autorIdTeste
      },

      isGeradoIA: false,
      isDerivado: false
    };

    this.salvando = true;

    this.planoAulaApi.cadastrar(dadosPlano)
      .pipe(
        finalize(() => {
          this.salvando = false;
        })
      )
      .subscribe({

        next: async (resposta) => {
          console.log(
            'Plano de aula cadastrado com sucesso!',
            resposta
          );

          const alert = await this.alertController.create({
            header: 'Plano enviado!',
            message: 'Seu plano de aula foi cadastrado e enviado para moderação.',
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  this.router.navigate(['/visitante']);
                }
              }
            ],
            backdropDismiss: false
          });
          await alert.present();
        },

        error: async (erro: HttpErrorResponse) => {
          console.error('Erro ao cadastrar plano:', erro);

          let mensagem = 'Não foi possível cadastrar o plano.';

          if (erro.status === 0) {
            mensagem = 'Não foi possível conectar ao servidor. Verifique a API ou o CORS.';
          } else if (erro.status === 400) {
            mensagem = 'Os dados enviados são inválidos.';
          } else if (erro.status === 403) {
            mensagem = 'Você não possui permissão para publicar.';
          } else if (erro.status === 404) {
            mensagem = 'A rota ou algum recurso não foi encontrado.';
          } else if (erro.status === 503) {
            mensagem = 'O servidor está temporariamente indisponível.';
          } else if (erro.status >= 500) {
            mensagem = 'Ocorreu um erro interno no servidor.';
          }

          await this.exibirMensagem('Erro', mensagem);
        }

      });
  }

  async exibirMensagem(titulo: string, mensagem: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensagem,
      buttons: ['OK']
    });

    await alert.present();
  }

  validarEtapaAtual(): boolean {
    let camposValidacao: string[] = [];

    switch (this.etapaAtual) {
      case 1:
        camposValidacao = ['titulo', 'resumo'];
        break;
      case 2:
        camposValidacao = ['tipo_atividade', 'etapa_ensino', 'anos_indicados', 'duracao_estimada'];
        break;
      case 3:
        camposValidacao = ['metodologia', 'materiais_necessarios', 'criterios_avaliacao'];
        break;
      case 4:
        return true;
    }

    let isValid = true;
    camposValidacao.forEach(field => {
      const control = this.planoForm.get(field);
      if (control && control.invalid) {
        control.markAsTouched();
        isValid = false;
      }
    });

    return isValid;
  }

  async onFileSelected(event: any) {
    const ficheiro = event.target.files[0];

    if (ficheiro) {
      try {
        const base64Data = await this.converterParaBase64(ficheiro);

        const nomeFicheiro = `${new Date().getTime()}_${ficheiro.name}`;

        const resultado = await Filesystem.writeFile({
          path: nomeFicheiro,
          data: base64Data,
          directory: Directory.Data
        });

        this.planoForm.patchValue({ imagem_capa: resultado.uri });
        console.log('Ficheiro guardado com sucesso no caminho:', resultado.uri);
        alert('Imagem guardada localmente com sucesso!');

      } catch (erro) {
        console.error('Erro ao guardar o ficheiro:', erro);
        alert('Ocorreu um erro ao guardar a imagem.');
      }
    }
  }

  private converterParaBase64(ficheiro: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const stringBase64 = reader.result as string;
        const base64Limpo = stringBase64.split(',')[1];
        resolve(base64Limpo);
      };

      reader.onerror = (erro) => {
        reject(erro);
      };

      reader.readAsDataURL(ficheiro);
    });
  }
}