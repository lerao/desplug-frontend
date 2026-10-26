import {
  AfterViewChecked,
  Component,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonTextarea
} from '@ionic/angular';

interface Mensagem {
  texto: string;
  autor: 'usuario' | 'ia';
  etiqueta?: string;
}

@Component({
  selector: 'app-chat-ia',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    IonButton,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonTextarea
  ],
  templateUrl: './chat-ia.page.html',
  styleUrls: ['./chat-ia.page.scss']
})
export class ChatIaPage implements AfterViewChecked {

  @ViewChild(IonContent)
  chatContent!: IonContent;

  mensagem = '';
  carregando = false;
  precisaRolar = false;

  mensagens: Mensagem[] = [
    {
      texto: 'Olá, professora Ana. Já analisei o plano original. Para adaptar a atividade, quais materiais estão disponíveis e como você descreveria o perfil da turma?',
      autor: 'ia'
    },
    {
      texto: 'Temos papelão, tampinhas, barbante e materiais de desenho, mas não há computadores na sala. É uma turma do 6º ano, entre 11 e 12 anos, curiosa e colaborativa.',
      autor: 'usuario'
    },
    {
      texto: 'Ótimo. Vou manter a habilidade EF06CO01 e transformar a prática em uma dinâmica desplugada. Você prefere grupos pequenos e uma avaliação rápida ao final?',
      autor: 'ia',
      etiqueta: 'contexto registrado'
    },
    {
      texto: 'Sim. Organize em grupos de quatro e inclua uma rubrica simples para avaliar sequência lógica, depuração e colaboração.',
      autor: 'usuario'
    },
    {
      texto: 'Perfeito. Estruturei uma atividade de 45 minutos com materiais concretos, teste entre pares e síntese coletiva. A primeira versão da adaptação está pronta para visualização.',
      autor: 'ia',
      etiqueta: 'pronto para gerar'
    }
  ];

  ngAfterViewChecked(): void {
    if (this.precisaRolar) {
      this.rolarParaBaixo();
      this.precisaRolar = false;
    }
  }

  enviarMensagem(): void {
    const texto = this.mensagem.trim();

    if (!texto || this.carregando) {
      return;
    }

    this.mensagens.push({
      texto,
      autor: 'usuario'
    });

    this.mensagem = '';
    this.carregando = true;
    this.precisaRolar = true;

    setTimeout(() => {
      const resposta = this.gerarResposta(texto);

      this.mensagens.push({
        texto: resposta,
        autor: 'ia',
        etiqueta: 'contexto atualizado'
      });

      this.carregando = false;
      this.precisaRolar = true;
    }, 1000);
  }

  limparConversa(): void {
    this.mensagens = [
      {
        texto: 'Vamos adaptar seu plano de aula. Diga qual ajuste você gostaria de fazer.',
        autor: 'ia',
        etiqueta: 'contexto registrado'
      }
    ];

    this.precisaRolar = true;
  }

  gerarPlanoAula(): void {
    if (this.carregando) {
      return;
    }

    this.carregando = true;
    this.precisaRolar = true;

    setTimeout(() => {
      this.mensagens.push({
        texto: 'O plano de aula foi gerado com os ajustes registrados: atividade de 45 minutos, grupos de quatro e rubrica para avaliar sequência lógica, depuração e colaboração.',
        autor: 'ia',
        etiqueta: 'plano pronto'
      });

      this.carregando = false;
      this.precisaRolar = true;
    }, 1000);
  }

  pressionarTecla(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensagem();
    }
  }

  private gerarResposta(pergunta: string): string {
    const texto = pergunta.toLowerCase();

    if (
      texto.includes('algoritmo') ||
      texto.includes('programação') ||
      texto.includes('programacao')
    ) {
      return (
        'Claro! 💻 Uma atividade interessante é pedir aos alunos que criem ' +
        'um algoritmo para realizar uma tarefa do cotidiano, como preparar ' +
        'um sanduíche ou organizar uma mochila. Depois, eles podem transformar ' +
        'o passo a passo em pseudocódigo.'
      );
    }

    if (texto.includes('bncc')) {
      return (
        'A BNCC Computação pode ser trabalhada envolvendo pensamento ' +
        'computacional, cultura digital e mundo digital. 💡 Posso ajudar você ' +
        'a relacionar uma atividade específica às habilidades e objetivos ' +
        'de aprendizagem.'
      );
    }

    if (
      texto.includes('plano de aula') ||
      texto.includes('plano')
    ) {
      return (
        'Claro! 📚 Para montar um bom plano de aula, podemos definir: ' +
        'tema, público-alvo, objetivos, habilidades da BNCC Computação, ' +
        'metodologia, recursos, duração e avaliação.'
      );
    }

    if (
      texto.includes('desplugada') ||
      texto.includes('sem computador')
    ) {
      return (
        'Uma atividade desplugada pode trabalhar lógica e algoritmos sem ' +
        'computadores. 🧩 Por exemplo: entregue cartões com comandos e peça ' +
        'aos alunos para organizá-los na ordem correta para realizar uma tarefa.'
      );
    }

    return (
      'Entendi! 😊 Posso ajudar você a criar atividades, planos de aula, ' +
      'ideias envolvendo a BNCC Computação, atividades plugadas ou desplugadas ' +
      'e conteúdos relacionados à tecnologia e educação.'
    );
  }

  private rolarParaBaixo(): void {
    void this.chatContent?.scrollToBottom(250);
  }
}