<template>
    <v-dialog v-model="model" fullscreen transition="dialog-bottom-transition">
        <v-card>
            <!-- Toolbar -->
            <v-toolbar class="custom-toolbar" color="background">
                <v-btn icon @click="fechar">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>

                <v-toolbar-title class="toolbar-title">
                    Endereço de Entrega
                </v-toolbar-title>

                <v-spacer />
            </v-toolbar>

            <v-card-text class="pa-4">
                <div class="endereco-container">
                    <!-- Lista de Endereços Salvos -->
                    <div v-if="enderecosSalvos.length > 0" class="enderecos-list">
                        <h4 class="text-subtitle-1 font-weight-medium mb-3">
                            Meus Endereços
                        </h4>
                        
                        <div 
                            v-for="endereco in enderecosSalvos" 
                            :key="endereco.id"
                            class="endereco-item"
                            :class="{ 'endereco-selecionado': enderecoSelecionado?.id === endereco.id }"
                        >
                            <v-radio-group 
                                :model-value="enderecoSelecionado?.id" 
                                @update:model-value="selecionarEndereco(endereco.id)"
                                hide-details
                                class="radio-group"
                            >
                                <v-radio 
                                    :value="endereco.id"
                                    color="primary"
                                    class="endereco-radio"
                                >
                                    <template #label>
                                        <div class="endereco-conteudo">
                                            <div class="endereco-header">
                                                <strong>{{ endereco.nome }}</strong>
                                                <v-chip 
                                                    v-if="endereco.padrao" 
                                                    size="x-small" 
                                                    color="primary" 
                                                    class="ml-2"
                                                >
                                                    Padrão
                                                </v-chip>
                                            </div>
                                            <div class="endereco-detalhes">
                                                <div>{{ endereco.rua }}, {{ endereco.numero }}</div>
                                                <div v-if="endereco.complemento">{{ endereco.complemento }}</div>
                                                <div>{{ endereco.bairro }} - {{ endereco.cidade }}/{{ endereco.estado }}</div>
                                                <div>CEP: {{ endereco.cep }}</div>
                                                <div class="referencia">Ref: {{ endereco.referencia }}</div>
                                            </div>
                                        </div>
                                    </template>
                                </v-radio>
                            </v-radio-group>

                            <div class="endereco-actions">
                                <v-btn
                                    icon="mdi-pencil"
                                    size="x-small"
                                    variant="text"
                                    color="primary"
                                    @click="editarEndereco(endereco)"
                                >
                                </v-btn>
                                <v-btn
                                    icon="mdi-delete"
                                    size="x-small"
                                    variant="text"
                                    color="error"
                                    @click="confirmarExclusao(endereco)"
                                    :disabled="endereco.padrao && enderecosSalvos.length === 1"
                                >
                                </v-btn>
                            </div>
                        </div>
                    </div>

                    <!-- Formulário de Edição/Adição -->
                    <div class="form-section">
                        <h4 class="text-subtitle-1 font-weight-medium mb-3">
                            {{ modoEdicao ? 'Editar Endereço' : 'Adicionar Novo Endereço' }}
                        </h4>

                        <div class="field">
                            <label>Nome do Endereço *</label>
                            <input v-model="enderecoForm.nome" type="text" placeholder="Ex: Casa, Trabalho, etc." />
                        </div>

                        <div class="field-row">
                            <div class="field flex-3">
                                <label>Rua *</label>
                                <input v-model="enderecoForm.rua" type="text" />
                            </div>

                            <div class="field" style="width:20%">
                                <label>Nº</label>
                                <input v-model="enderecoForm.numero" type="text" />
                            </div>
                        </div>

                        <div class="field">
                            <label>Complemento</label>
                            <input v-model="enderecoForm.complemento" type="text" />
                            <small>Apto/Bloco/Casa</small>
                        </div>

                        <div class="field">
                            <label>Bairro *</label>
                            <input v-model="enderecoForm.bairro" type="text" />
                        </div>

                        <div class="field">
                            <label>Ponto de referência *</label>
                            <input v-model="enderecoForm.referencia" type="text" />
                        </div>

                        <div class="field-row">
                            <div class="field" style="width:70%">
                                <label>Cidade *</label>
                                <input v-model="enderecoForm.cidade" type="text" />
                            </div>

                            <div class="field" style="width:30%">
                                <label>Estado *</label>
                                <input v-model="enderecoForm.estado" type="text" maxlength="2" />
                            </div>
                        </div>

                        <div class="field">
                            <label>CEP *</label>
                            <input v-model="enderecoForm.cep" type="text" placeholder="00000-000" @input="formatarCep" />
                        </div>
                    </div>

                    <!-- Botões de Ação -->
                    <div class="action-buttons">
                        <button 
                            class="btn-adicionar" 
                            @click="adicionarNovoEndereco"
                            :disabled="loading"
                        >
                            <v-icon left>mdi-plus</v-icon>
                            Adicionar Novo Endereço
                        </button>

                        <button 
                            class="btn-confirmar" 
                            @click="confirmarEndereco"
                            :disabled="!enderecoSelecionado || loading"
                            :loading="loading"
                        >
                            <span v-if="loading">PROCESSANDO...</span>
                            <span v-else>CONFIRMAR ENDEREÇO SELECIONADO</span>
                        </button>
                    </div>
                </div>
            </v-card-text>
        </v-card>

        <!-- Diálogo de Confirmação de Exclusão -->
        <v-dialog v-model="dialogExclusao" max-width="400">
            <v-card>
                <v-card-title class="text-h6">
                    Excluir Endereço
                </v-card-title>
                
                <v-card-text>
                    Tem certeza que deseja excluir o endereço "{{ enderecoParaExcluir?.nome }}"?
                    <br><br>
                    Esta ação não poderá ser desfeita.
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="dialogExclusao = false">Cancelar</v-btn>
                    <v-btn 
                        color="error" 
                        @click="excluirEndereco"
                        :loading="loadingExclusao"
                    >
                        Excluir
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { EnderecosSalvosService, type EnderecoSalvo } from '@/services/enderecosSalvosService/EnderecosSalvosService'

export default defineComponent({
    name: 'DialogEnderecoEntrega',

    props: {
        modelValue: {
            type: Boolean,
            required: true,
        },
    },

    emits: ['update:modelValue', 'confirmar'],

    data() {
        return {
            loading: false,
            loadingExclusao: false,
            dialogExclusao: false,
            enderecoParaExcluir: null as EnderecoSalvo | null,
            enderecosSalvosService: new EnderecosSalvosService(),
            enderecosSalvos: [] as EnderecoSalvo[],
            enderecoSelecionado: null as EnderecoSalvo | null,
            enderecoForm: {
                id: '',
                nome: '',
                rua: '',
                numero: '',
                complemento: '',
                bairro: '',
                cep: '',
                referencia: '',
                cidade: '',
                estado: '',
                padrao: false
            },
            modoEdicao: false,
        }
    },

    computed: {
        model: {
            get() {
                return this.modelValue
            },
            set(value: boolean) {
                if (!value) this.reset()
                this.$emit('update:modelValue', value)
            },
        },
    },

    watch: {
        modelValue(newVal) {
            if (newVal) {
                this.carregarEnderecos()
            }
        }
    },

    methods: {
        carregarEnderecos() {
            this.enderecosSalvos = this.enderecosSalvosService.listar()
            
            // Se não há endereços, inicia no modo de adição
            if (this.enderecosSalvos.length === 0) {
                this.adicionarNovoEndereco()
            } else {
                // Seleciona o endereço padrão ou o primeiro
                const enderecoPadrao = this.enderecosSalvos.find(e => e.padrao) || this.enderecosSalvos[0]
                this.enderecoSelecionado = enderecoPadrao || null
                this.carregarEnderecoParaEdicao()
            }
        },

        carregarEnderecoParaEdicao() {
            if (this.enderecoSelecionado) {
                this.enderecoForm = { 
                    id: this.enderecoSelecionado.id,
                    nome: this.enderecoSelecionado.nome,
                    rua: this.enderecoSelecionado.rua,
                    numero: this.enderecoSelecionado.numero,
                    complemento: this.enderecoSelecionado.complemento || '',
                    bairro: this.enderecoSelecionado.bairro,
                    cep: this.enderecoSelecionado.cep,
                    referencia: this.enderecoSelecionado.referencia,
                    cidade: this.enderecoSelecionado.cidade,
                    estado: this.enderecoSelecionado.estado,
                    padrao: this.enderecoSelecionado.padrao || false
                }
                this.modoEdicao = true
            }
        },

        selecionarEndereco(id: string) {
            const endereco = this.enderecosSalvos.find(e => e.id === id)
            if (endereco) {
                this.enderecoSelecionado = endereco
                this.carregarEnderecoParaEdicao()
            }
        },

        editarEndereco(endereco: EnderecoSalvo) {
            this.selecionarEndereco(endereco.id)
        },

        adicionarNovoEndereco() {
            this.enderecoForm = {
                id: '',
                nome: '',
                rua: '',
                numero: '',
                complemento: '',
                bairro: '',
                cep: '',
                referencia: '',
                cidade: '',
                estado: '',
                padrao: false
            }
            this.modoEdicao = false
            this.enderecoSelecionado = null
        },

        formatarCep() {
            this.enderecoForm.cep = this.enderecoForm.cep
                .replace(/\D/g, '')
                .replace(/^(\d{5})(\d)/, '$1-$2')
                .slice(0, 9)
        },

        async confirmarEndereco() {
            if (!this.enderecoSelecionado) {
                alert('Por favor, selecione um endereço.')
                return
            }

            this.loading = true
            
            try {
                // Validação dos campos obrigatórios
                if (!this.enderecoForm.nome?.trim()) {
                    alert('Por favor, informe um nome para o endereço.')
                    return
                }

                if (!this.enderecoForm.rua?.trim() || 
                    !this.enderecoForm.numero?.trim() || 
                    !this.enderecoForm.bairro?.trim() || 
                    !this.enderecoForm.cidade?.trim() || 
                    !this.enderecoForm.estado?.trim() || 
                    !this.enderecoForm.cep?.trim() || 
                    !this.enderecoForm.referencia?.trim()) {
                    alert('Por favor, preencha todos os campos obrigatórios.')
                    return
                }

                // Salva ou atualiza o endereço
                let enderecoSalvo: EnderecoSalvo
                if (this.modoEdicao && this.enderecoForm.id) {
                    // Modo de edição
                    enderecoSalvo = await this.enderecosSalvosService.atualizar(this.enderecoForm.id, this.enderecoForm)
                } else {
                    // Modo de criação
                    enderecoSalvo = this.enderecosSalvosService.salvar(this.enderecoForm)
                }

                // Recarrega a lista e seleciona o endereço salvo
                this.carregarEnderecos()
                this.selecionarEndereco(enderecoSalvo.id)
                
            } catch (error) {
                console.error('Erro ao salvar endereço:', error)
                alert('Ocorreu um erro ao salvar seu endereço. Tente novamente.')
            } finally {
                this.loading = false
            }
        },

        confirmarExclusao(endereco: EnderecoSalvo) {
            this.enderecoParaExcluir = endereco
            this.dialogExclusao = true
        },

        async excluirEndereco() {
            if (!this.enderecoParaExcluir) return

            try {
                this.loadingExclusao = true
                await this.enderecosSalvosService.excluir(this.enderecoParaExcluir.id)
                
                // Se o endereço excluído era o selecionado, limpa a seleção
                if (this.enderecoSelecionado?.id === this.enderecoParaExcluir.id) {
                    this.enderecoSelecionado = null
                }
                
                this.carregarEnderecos()
                this.dialogExclusao = false
                this.enderecoParaExcluir = null
            } catch (error) {
                console.error('Erro ao excluir endereço:', error)
                alert('Não foi possível excluir o endereço')
            } finally {
                this.loadingExclusao = false
            }
        },

        async confirmarEnderecoSelecionado() {
            if (!this.enderecoSelecionado) {
                alert('Por favor, selecione um endereço.')
                return
            }

            this.loading = true
            
            try {
                // Primeiro, salva qualquer alteração pendente no formulário
                if (this.modoEdicao && this.enderecoForm.id) {
                    await this.enderecosSalvosService.atualizar(this.enderecoForm.id, this.enderecoForm)
                }

                // Emite o endereço selecionado para o componente pai
                this.$emit('confirmar', this.enderecoSelecionado)
                this.fechar()
                
            } catch (error) {
                console.error('Erro ao confirmar endereço:', error)
                alert('Ocorreu um erro ao confirmar o endereço. Tente novamente.')
            } finally {
                this.loading = false
            }
        },

        fechar() {
            this.model = false
        },

        reset() {
            this.enderecosSalvos = []
            this.enderecoSelecionado = null
            this.enderecoForm = {
                id: '',
                nome: '',
                rua: '',
                numero: '',
                complemento: '',
                bairro: '',
                cep: '',
                referencia: '',
                cidade: '',
                estado: '',
                padrao: false
            }
            this.modoEdicao = false
            this.dialogExclusao = false
            this.enderecoParaExcluir = null
        },
    },
})
</script>

<style scoped>
.custom-toolbar {
    font-family: 'Montserrat', sans-serif;
    border-bottom: 1px solid #e5e5e5;
}

.toolbar-title {
    font-size: 16px;
    font-weight: 600;
    color: #2e2e2e;
}

.custom-toolbar .v-icon {
    color: #2e2e2e;
}

.endereco-container {
    max-width: 600px;
    margin: 0 auto;
}

.enderecos-list {
    margin-bottom: 32px;
}

.endereco-item {
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    margin-bottom: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
    position: relative;
}

.endereco-item:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.endereco-item.endereco-selecionado {
    border-color: #1976d2;
    background-color: #f5f9ff;
}

.radio-group {
    width: 100%;
}

.endereco-radio {
    width: 100%;
    margin: 0;
}

.endereco-conteudo {
    width: 100%;
    padding: 16px;
}

.endereco-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.endereco-detalhes {
    font-size: 0.9rem;
    color: #666;
    line-height: 1.4;
}

.endereco-detalhes div {
    margin-bottom: 2px;
}

.referencia {
    font-style: italic;
    color: #888;
    margin-top: 4px;
}

.endereco-actions {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 4px;
}

.form-section {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 24px;
}

.field {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
}

.field label {
    font-size: 13px;
    color: #6f6f6f;
    margin-bottom: 6px;
    font-weight: 500;
}

.field input {
    height: 44px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    padding: 0 12px;
    font-size: 14px;
    color: #333;
    background-color: white;
}

.field input:focus {
    outline: none;
    border-color: #1976d2;
}

.field small {
    font-size: 12px;
    color: #9e9e9e;
    margin-top: 4px;
}

.field-row {
    display: flex;
    gap: 12px;
}

.flex-3 {
    flex: 3;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.btn-adicionar {
    width: 100%;
    height: 48px;
    background: #fff;
    color: #1976d2;
    border: 2px solid #1976d2;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.btn-adicionar:hover {
    background-color: #f5f9ff;
}

.btn-adicionar:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-confirmar {
    width: 100%;
    height: 48px;
    background-color: #018005;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-confirmar:hover {
    background-color: #016a04;
}

.btn-confirmar:disabled {
    background-color: #bdbdbd;
    cursor: not-allowed;
}
</style>