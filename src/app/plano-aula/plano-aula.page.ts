import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-plano-aula',
  templateUrl: './plano-aula.page.html',
  styleUrls: ['./plano-aula.page.scss'],
  standalone: false,
})
export class PlanoAulaPage {

  etapaAtual: number = 1;
  totalEtapas: number = 4;

  plano = {
    titulo: '',
    resumo: '',
    tipoAtividade: '',
    etapaEnsino: '',
    anosIndicados: '',
    duracao: '',
    metodologia: '',
    materiais: '',
    criterios: ''
  };

  // Títulos dinâmicos do cabeçalho
  etapasTitulos: Record<number, string> = {
    1: 'Identificação',
    2: 'Classificação',
    3: 'Conteúdo',
    4: 'BNCC & Publicação'
  };

  bnccHab = [
    { code: 'EM13CO01', tag: 'Pensamento Computacional', desc: 'Reconhecer e compreender os conceitos de algoritmos e pensamento computacional.' },
    { code: 'EF05CI02', tag: 'Mundo Digital', desc: 'Identificar os cuidados necessários para a preservação do meio ambiente digital.' },
    { code: 'EF06CO03', tag: 'Pensamento Computacional', desc: 'Desenvolver e aplicar conceitos de lógica para resolução de problemas.' },
    { code: 'EF09CO01', tag: 'Cultura Digital', desc: 'Analisar criticamente o impacto das tecnologias digitais na sociedade.' }
  ];

  constructor(private toastCtrl: ToastController) {}

  async proxEtapa() {
    if (!this.validarEtapaAtual()) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor, preencha todos os campos obrigatórios (*).',
        duration: 2000,
        position: 'top',
        color: 'custom-toast',
      });
      toast.present();
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

  publicarPlano() {
    console.log('Dados do plano prontos para salvar:', this.plano);
    // Lógica de envio para o backend entra aqui
  }

  validarEtapaAtual(): boolean {
    switch (this.etapaAtual) {
      case 1:
        return this.plano.titulo.trim() !== '' && this.plano.resumo.trim() !== '';
      
      case 2:
        return this.plano.tipoAtividade !== '' &&   this.plano.etapaEnsino !== '' && this.plano.anosIndicados.trim() !== '' &&
               this.plano.duracao.trim() !== '';
      
      case 3:
        return this.plano.metodologia.trim() !== '' && this.plano.materiais.trim() !== '' && this.plano.criterios.trim() !== '';

      case 4:
        return true;

      default:
        return true;
    }
  }
}