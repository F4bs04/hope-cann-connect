export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      acompanhamento: {
        Row: {
          data_registro: string | null
          efeitos_colaterais: string | null
          eficacia: string
          id: number
          id_medico: number | null
          id_paciente: number | null
          notas_adicionais: string | null
          sintomas: string | null
        }
        Insert: {
          data_registro?: string | null
          efeitos_colaterais?: string | null
          eficacia: string
          id?: never
          id_medico?: number | null
          id_paciente?: number | null
          notas_adicionais?: string | null
          sintomas?: string | null
        }
        Update: {
          data_registro?: string | null
          efeitos_colaterais?: string | null
          eficacia?: string
          id?: never
          id_medico?: number | null
          id_paciente?: number | null
          notas_adicionais?: string | null
          sintomas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acompanhamento_id_medico_fkey"
            columns: ["id_medico"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acompanhamento_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      admins_clinica: {
        Row: {
          cargo: string
          cpf: string
          id: number
          id_clinica: number | null
          id_usuario: number | null
          nome: string
          permissoes: Json
          telefone: string
        }
        Insert: {
          cargo: string
          cpf: string
          id?: never
          id_clinica?: number | null
          id_usuario?: number | null
          nome: string
          permissoes: Json
          telefone: string
        }
        Update: {
          cargo?: string
          cpf?: string
          id?: never
          id_clinica?: number | null
          id_usuario?: number | null
          nome?: string
          permissoes?: Json
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_clinica_id_clinica_fkey"
            columns: ["id_clinica"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admins_clinica_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      atestados: {
        Row: {
          assinado: boolean | null
          cid: string | null
          data_emissao: string | null
          id: number
          id_paciente: number | null
          justificativa: string | null
          tempo_afastamento: number
          unidade_tempo: string | null
        }
        Insert: {
          assinado?: boolean | null
          cid?: string | null
          data_emissao?: string | null
          id?: number
          id_paciente?: number | null
          justificativa?: string | null
          tempo_afastamento: number
          unidade_tempo?: string | null
        }
        Update: {
          assinado?: boolean | null
          cid?: string | null
          data_emissao?: string | null
          id?: number
          id_paciente?: number | null
          justificativa?: string | null
          tempo_afastamento?: number
          unidade_tempo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atestados_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "pacientes_app"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_ativo: {
        Row: {
          ativo: boolean | null
          data_fim: string
          data_inicio: string
          id: number
          id_consulta: number | null
          id_medico: number
          id_paciente: number
        }
        Insert: {
          ativo?: boolean | null
          data_fim: string
          data_inicio?: string
          id?: number
          id_consulta?: number | null
          id_medico: number
          id_paciente: number
        }
        Update: {
          ativo?: boolean | null
          data_fim?: string
          data_inicio?: string
          id?: number
          id_consulta?: number | null
          id_medico?: number
          id_paciente?: number
        }
        Relationships: []
      }
      clinic_users: {
        Row: {
          clinic_id: number | null
          created_at: string | null
          id: string
          role: string
          user_id: number | null
        }
        Insert: {
          clinic_id?: number | null
          created_at?: string | null
          id?: string
          role: string
          user_id?: number | null
        }
        Update: {
          clinic_id?: number | null
          created_at?: string | null
          id?: string
          role?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_users_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      clinicas: {
        Row: {
          cnpj: string
          data_cadastro: string | null
          email: string
          endereco: string
          id: number
          nome: string
          senha_hash: string | null
          status: boolean | null
          telefone: string
        }
        Insert: {
          cnpj: string
          data_cadastro?: string | null
          email: string
          endereco: string
          id?: never
          nome: string
          senha_hash?: string | null
          status?: boolean | null
          telefone: string
        }
        Update: {
          cnpj?: string
          data_cadastro?: string | null
          email?: string
          endereco?: string
          id?: never
          nome?: string
          senha_hash?: string | null
          status?: boolean | null
          telefone?: string
        }
        Relationships: []
      }
      consultas: {
        Row: {
          data_criacao: string | null
          data_hora: string
          id: number
          id_clinica: number | null
          id_medico: number | null
          id_paciente: number | null
          motivo: string
          observacoes: string | null
          status: string | null
          tipo_consulta: string
          valor_consulta: number | null
        }
        Insert: {
          data_criacao?: string | null
          data_hora: string
          id?: never
          id_clinica?: number | null
          id_medico?: number | null
          id_paciente?: number | null
          motivo: string
          observacoes?: string | null
          status?: string | null
          tipo_consulta: string
          valor_consulta?: number | null
        }
        Update: {
          data_criacao?: string | null
          data_hora?: string
          id?: never
          id_clinica?: number | null
          id_medico?: number | null
          id_paciente?: number | null
          motivo?: string
          observacoes?: string | null
          status?: string | null
          tipo_consulta?: string
          valor_consulta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consultas_id_clinica_fkey"
            columns: ["id_clinica"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_id_medico_fkey"
            columns: ["id_medico"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          caminho_arquivo: string
          data_upload: string | null
          descricao: string
          id: number
          id_paciente: number | null
          id_usuario_upload: number | null
          tipo: string
        }
        Insert: {
          caminho_arquivo: string
          data_upload?: string | null
          descricao: string
          id?: never
          id_paciente?: number | null
          id_usuario_upload?: number | null
          tipo: string
        }
        Update: {
          caminho_arquivo?: string
          data_upload?: string | null
          descricao?: string
          id?: never
          id_paciente?: number | null
          id_usuario_upload?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_id_usuario_upload_fkey"
            columns: ["id_usuario_upload"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_medico: {
        Row: {
          alergias: string | null
          condicoes_medicas: string | null
          historico_familiar: string | null
          id: number
          id_paciente: number | null
          medicamentos_atuais: string | null
          ultima_atualizacao: string | null
        }
        Insert: {
          alergias?: string | null
          condicoes_medicas?: string | null
          historico_familiar?: string | null
          id?: never
          id_paciente?: number | null
          medicamentos_atuais?: string | null
          ultima_atualizacao?: string | null
        }
        Update: {
          alergias?: string | null
          condicoes_medicas?: string | null
          historico_familiar?: string | null
          id?: never
          id_paciente?: number | null
          medicamentos_atuais?: string | null
          ultima_atualizacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_medico_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios_disponiveis: {
        Row: {
          dia_semana: string
          hora_fim: string
          hora_inicio: string
          id: number
          id_medico: number | null
        }
        Insert: {
          dia_semana: string
          hora_fim: string
          hora_inicio: string
          id?: number
          id_medico?: number | null
        }
        Update: {
          dia_semana?: string
          hora_fim?: string
          hora_inicio?: string
          id?: number
          id_medico?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "horarios_disponiveis_id_medico_fkey"
            columns: ["id_medico"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
        ]
      }
      laudos: {
        Row: {
          assinado: boolean | null
          cid: string | null
          conclusao: string
          data_emissao: string | null
          descricao: string
          id: number
          id_paciente: number | null
          objetivo: string
          observacoes: string | null
          tipo_laudo: string
        }
        Insert: {
          assinado?: boolean | null
          cid?: string | null
          conclusao: string
          data_emissao?: string | null
          descricao: string
          id?: number
          id_paciente?: number | null
          objetivo: string
          observacoes?: string | null
          tipo_laudo: string
        }
        Update: {
          assinado?: boolean | null
          cid?: string | null
          conclusao?: string
          data_emissao?: string | null
          descricao?: string
          id?: number
          id_paciente?: number | null
          objetivo?: string
          observacoes?: string | null
          tipo_laudo?: string
        }
        Relationships: [
          {
            foreignKeyName: "laudos_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "pacientes_app"
            referencedColumns: ["id"]
          },
        ]
      }
      log_atividades: {
        Row: {
          data_hora: string | null
          descricao: string | null
          endereco_ip: string | null
          id: number
          id_usuario: number | null
          tipo_atividade: string
        }
        Insert: {
          data_hora?: string | null
          descricao?: string | null
          endereco_ip?: string | null
          id?: never
          id_usuario?: number | null
          tipo_atividade: string
        }
        Update: {
          data_hora?: string | null
          descricao?: string | null
          endereco_ip?: string | null
          id?: never
          id_usuario?: number | null
          tipo_atividade?: string
        }
        Relationships: [
          {
            foreignKeyName: "log_atividades_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      medicos: {
        Row: {
          aprovado: boolean
          biografia: string | null
          cpf: string
          crm: string
          data_aprovacao: string | null
          especialidade: string
          foto_perfil: string | null
          id: number
          id_clinica: number | null
          id_usuario: number | null
          nome: string
          senha_hash: string | null
          status_disponibilidade: boolean | null
          telefone: string
          valor_por_consulta: number | null
        }
        Insert: {
          aprovado?: boolean
          biografia?: string | null
          cpf: string
          crm: string
          data_aprovacao?: string | null
          especialidade: string
          foto_perfil?: string | null
          id?: never
          id_clinica?: number | null
          id_usuario?: number | null
          nome: string
          senha_hash?: string | null
          status_disponibilidade?: boolean | null
          telefone: string
          valor_por_consulta?: number | null
        }
        Update: {
          aprovado?: boolean
          biografia?: string | null
          cpf?: string
          crm?: string
          data_aprovacao?: string | null
          especialidade?: string
          foto_perfil?: string | null
          id?: never
          id_clinica?: number | null
          id_usuario?: number | null
          nome?: string
          senha_hash?: string | null
          status_disponibilidade?: boolean | null
          telefone?: string
          valor_por_consulta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medicos_id_clinica_fkey"
            columns: ["id_clinica"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicos_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_chat: {
        Row: {
          data_envio: string
          id: number
          id_consulta: number | null
          id_medico: number
          id_paciente: number
          lida: boolean | null
          mensagem: string
          remetente_tipo: string
        }
        Insert: {
          data_envio?: string
          id?: number
          id_consulta?: number | null
          id_medico: number
          id_paciente: number
          lida?: boolean | null
          mensagem: string
          remetente_tipo: string
        }
        Update: {
          data_envio?: string
          id?: number
          id_consulta?: number | null
          id_medico?: number
          id_paciente?: number
          lida?: boolean | null
          mensagem?: string
          remetente_tipo?: string
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          data_criacao: string | null
          data_leitura: string | null
          id: number
          id_usuario: number | null
          mensagem: string
          status: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          data_criacao?: string | null
          data_leitura?: string | null
          id?: never
          id_usuario?: number | null
          mensagem: string
          status?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          data_criacao?: string | null
          data_leitura?: string | null
          id?: never
          id_usuario?: number | null
          mensagem?: string
          status?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          cpf: string
          data_cadastro: string | null
          data_nascimento: string
          email: string
          endereco: string
          genero: string | null
          id: number
          id_usuario: number | null
          nome: string
          telefone: string
        }
        Insert: {
          cpf: string
          data_cadastro?: string | null
          data_nascimento: string
          email: string
          endereco: string
          genero?: string | null
          id?: never
          id_usuario?: number | null
          nome: string
          telefone: string
        }
        Update: {
          cpf?: string
          data_cadastro?: string | null
          data_nascimento?: string
          email?: string
          endereco?: string
          genero?: string | null
          id?: never
          id_usuario?: number | null
          nome?: string
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes_app: {
        Row: {
          condicao: string | null
          data_cadastro: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          genero: string | null
          id: number
          idade: number
          nome: string
          telefone: string | null
          ultima_consulta: string | null
        }
        Insert: {
          condicao?: string | null
          data_cadastro?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          genero?: string | null
          id?: number
          idade: number
          nome: string
          telefone?: string | null
          ultima_consulta?: string | null
        }
        Update: {
          condicao?: string | null
          data_cadastro?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          genero?: string | null
          id?: number
          idade?: number
          nome?: string
          telefone?: string | null
          ultima_consulta?: string | null
        }
        Relationships: []
      }
      pedidos_exame: {
        Row: {
          assinado: boolean | null
          data_solicitacao: string | null
          id: number
          id_paciente: number | null
          instrucoes: string | null
          justificativa: string
          nome_exame: string
          prioridade: string | null
          status: string | null
        }
        Insert: {
          assinado?: boolean | null
          data_solicitacao?: string | null
          id?: number
          id_paciente?: number | null
          instrucoes?: string | null
          justificativa: string
          nome_exame: string
          prioridade?: string | null
          status?: string | null
        }
        Update: {
          assinado?: boolean | null
          data_solicitacao?: string | null
          id?: number
          id_paciente?: number | null
          instrucoes?: string | null
          justificativa?: string
          nome_exame?: string
          prioridade?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_exame_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "pacientes_app"
            referencedColumns: ["id"]
          },
        ]
      }
      permissoes: {
        Row: {
          descricao: string | null
          id: number
          modulo: string
          nome: string
        }
        Insert: {
          descricao?: string | null
          id?: never
          modulo: string
          nome: string
        }
        Update: {
          descricao?: string | null
          id?: never
          modulo?: string
          nome?: string
        }
        Relationships: []
      }
      prescricoes: {
        Row: {
          codigo_verificacao: string
          data_emissao: string | null
          data_validade: string
          dosagem: string
          duracao: string
          frequencia: string
          id: number
          id_consulta: number | null
          id_medico: number | null
          id_paciente: number | null
          id_produto: number | null
          instrucoes_uso: string | null
          observacoes: string | null
          status: string | null
        }
        Insert: {
          codigo_verificacao: string
          data_emissao?: string | null
          data_validade: string
          dosagem: string
          duracao: string
          frequencia: string
          id?: never
          id_consulta?: number | null
          id_medico?: number | null
          id_paciente?: number | null
          id_produto?: number | null
          instrucoes_uso?: string | null
          observacoes?: string | null
          status?: string | null
        }
        Update: {
          codigo_verificacao?: string
          data_emissao?: string | null
          data_validade?: string
          dosagem?: string
          duracao?: string
          frequencia?: string
          id?: never
          id_consulta?: number | null
          id_medico?: number | null
          id_paciente?: number | null
          id_produto?: number | null
          instrucoes_uso?: string | null
          observacoes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescricoes_id_consulta_fkey"
            columns: ["id_consulta"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescricoes_id_medico_fkey"
            columns: ["id_medico"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescricoes_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescricoes_id_produto_fkey"
            columns: ["id_produto"]
            isOneToOne: false
            referencedRelation: "produtos_cannabis"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos_cannabis: {
        Row: {
          concentracao_cbd: number | null
          concentracao_thc: number | null
          descricao: string | null
          dosagem_padrao: string | null
          fabricante: string
          id: number
          nome: string
          status: boolean | null
          tipo: string
        }
        Insert: {
          concentracao_cbd?: number | null
          concentracao_thc?: number | null
          descricao?: string | null
          dosagem_padrao?: string | null
          fabricante: string
          id?: never
          nome: string
          status?: boolean | null
          tipo: string
        }
        Update: {
          concentracao_cbd?: number | null
          concentracao_thc?: number | null
          descricao?: string | null
          dosagem_padrao?: string | null
          fabricante?: string
          id?: never
          nome?: string
          status?: boolean | null
          tipo?: string
        }
        Relationships: []
      }
      prontuarios: {
        Row: {
          anamnese: Json | null
          data_consulta: string | null
          diagnostico: string | null
          id: number
          id_paciente: number | null
          observacoes: string | null
          sintomas: string | null
          soap: Json | null
          status: string | null
          tratamento: string | null
        }
        Insert: {
          anamnese?: Json | null
          data_consulta?: string | null
          diagnostico?: string | null
          id?: number
          id_paciente?: number | null
          observacoes?: string | null
          sintomas?: string | null
          soap?: Json | null
          status?: string | null
          tratamento?: string | null
        }
        Update: {
          anamnese?: Json | null
          data_consulta?: string | null
          diagnostico?: string | null
          id?: number
          id_paciente?: number | null
          observacoes?: string | null
          sintomas?: string | null
          soap?: Json | null
          status?: string | null
          tratamento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prontuarios_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "pacientes_app"
            referencedColumns: ["id"]
          },
        ]
      }
      receitas_app: {
        Row: {
          data: string | null
          data_validade: string | null
          id: number
          id_paciente: number | null
          medicamento: string
          observacoes: string | null
          posologia: string
          status: string | null
        }
        Insert: {
          data?: string | null
          data_validade?: string | null
          id?: number
          id_paciente?: number | null
          medicamento: string
          observacoes?: string | null
          posologia: string
          status?: string | null
        }
        Update: {
          data?: string | null
          data_validade?: string | null
          id?: number
          id_paciente?: number | null
          medicamento?: string
          observacoes?: string | null
          posologia?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receitas_app_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "pacientes_app"
            referencedColumns: ["id"]
          },
        ]
      }
      renovacoes_prescricao: {
        Row: {
          data_aprovacao: string | null
          data_solicitacao: string | null
          id: number
          id_medico: number | null
          id_paciente: number | null
          id_prescricao_anterior: number | null
          id_prescricao_nova: number | null
          observacoes: string | null
          status: string | null
        }
        Insert: {
          data_aprovacao?: string | null
          data_solicitacao?: string | null
          id?: never
          id_medico?: number | null
          id_paciente?: number | null
          id_prescricao_anterior?: number | null
          id_prescricao_nova?: number | null
          observacoes?: string | null
          status?: string | null
        }
        Update: {
          data_aprovacao?: string | null
          data_solicitacao?: string | null
          id?: never
          id_medico?: number | null
          id_paciente?: number | null
          id_prescricao_anterior?: number | null
          id_prescricao_nova?: number | null
          observacoes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "renovacoes_prescricao_id_medico_fkey"
            columns: ["id_medico"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renovacoes_prescricao_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renovacoes_prescricao_id_prescricao_anterior_fkey"
            columns: ["id_prescricao_anterior"]
            isOneToOne: false
            referencedRelation: "prescricoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renovacoes_prescricao_id_prescricao_nova_fkey"
            columns: ["id_prescricao_nova"]
            isOneToOne: false
            referencedRelation: "prescricoes"
            referencedColumns: ["id"]
          },
        ]
      }
      saldo_medicos: {
        Row: {
          id: number
          id_medico: number
          saldo_total: number
          ultima_atualizacao: string
        }
        Insert: {
          id?: number
          id_medico: number
          saldo_total?: number
          ultima_atualizacao?: string
        }
        Update: {
          id?: number
          id_medico?: number
          saldo_total?: number
          ultima_atualizacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_medico"
            columns: ["id_medico"]
            isOneToOne: true
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
        ]
      }
      saldo_pacientes: {
        Row: {
          id: number
          id_paciente: number
          saldo_total: number
          ultima_atualizacao: string
        }
        Insert: {
          id?: number
          id_paciente: number
          saldo_total?: number
          ultima_atualizacao?: string
        }
        Update: {
          id?: number
          id_paciente?: number
          saldo_total?: number
          ultima_atualizacao?: string
        }
        Relationships: []
      }
      transacoes_medicos: {
        Row: {
          data_transacao: string
          descricao: string
          id: number
          id_consulta: number | null
          id_medico: number
          status: string
          tipo: string
          valor: number
        }
        Insert: {
          data_transacao?: string
          descricao: string
          id?: number
          id_consulta?: number | null
          id_medico: number
          status?: string
          tipo: string
          valor: number
        }
        Update: {
          data_transacao?: string
          descricao?: string
          id?: number
          id_consulta?: number | null
          id_medico?: number
          status?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_consulta"
            columns: ["id_consulta"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_medico"
            columns: ["id_medico"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_permissoes: {
        Row: {
          id_permissao: number
          id_usuario: number
        }
        Insert: {
          id_permissao: number
          id_usuario: number
        }
        Update: {
          id_permissao?: number
          id_usuario?: number
        }
        Relationships: [
          {
            foreignKeyName: "usuario_permissoes_id_permissao_fkey"
            columns: ["id_permissao"]
            isOneToOne: false
            referencedRelation: "permissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_permissoes_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          data_criacao: string | null
          data_expiracao_token: string | null
          email: string
          id: number
          senha: string
          status: boolean | null
          tipo_usuario: string
          token_reset_senha: string | null
          ultimo_acesso: string | null
        }
        Insert: {
          data_criacao?: string | null
          data_expiracao_token?: string | null
          email: string
          id?: never
          senha: string
          status?: boolean | null
          tipo_usuario: string
          token_reset_senha?: string | null
          ultimo_acesso?: string | null
        }
        Update: {
          data_criacao?: string | null
          data_expiracao_token?: string | null
          email?: string
          id?: never
          senha?: string
          status?: boolean | null
          tipo_usuario?: string
          token_reset_senha?: string | null
          ultimo_acesso?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      verificar_chats_expirados: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      verify_clinic_password: {
        Args: { p_email: string; p_password: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
