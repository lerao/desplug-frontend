import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Filesystem, Directory } from '@capacitor/filesystem';

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

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.planoForm = this.fb.group({
      titulo: ['', Validators.required],
      resumo: ['', Validators.required],
      tipoAtividade: ['', Validators.required],
      etapaEnsino: ['', Validators.required],
      anosIndicados: ['', Validators.required],
      duracao: ['', Validators.required],
      metodologia: ['', Validators.required],
      materiais: ['', Validators.required],
      criterios: ['', Validators.required]
    });
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

  publicarPlano() {
    if (this.planoForm.valid) {
      console.log('Dados do plano prontos para salvar:', this.planoForm.value);
    }
  }

  validarEtapaAtual(): boolean {
    let camposValidacao: string[] = [];

    switch (this.etapaAtual) {
      case 1:
        camposValidacao = ['titulo', 'resumo'];
        break;
      case 2:
        camposValidacao = ['tipoAtividade', 'etapaEnsino', 'anosIndicados', 'duracao'];
        break;
      case 3:
        camposValidacao = ['metodologia', 'materiais', 'criterios'];
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