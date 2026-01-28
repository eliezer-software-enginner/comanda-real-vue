<template>
  <v-container class="pa-0">
    <!-- Header -->
    <v-card-title class="header">
      <v-btn icon variant="text" @click="voltar">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <span class="title">
        {{ lojista?.nomeLoja }}
      </span>
    </v-card-title>

    <div class="simple-tabs">
      <div class="tab" :class="{ active: tab === 'sobre' }" @click="tab = 'sobre'">Sobre</div>

      <div class="tab" :class="{ active: tab === 'horario' }" @click="tab = 'horario'">Horário</div>

      <div class="tab" :class="{ active: tab === 'pagamento' }" @click="tab = 'pagamento'">
        Pagamento
      </div>
    </div>

    <!-- Conteúdo -->
    <v-card-text>
      <v-window v-model="tab">
        <!-- SOBRE -->
        <v-window-item value="sobre">
          <div class="img">
            <img :src="lojista?.fotoUrl" class="avatar" alt="Logo da loja" />
          </div>

          <div class="content-center">
            <!-- Instagram (se existir futuramente) -->
            <!-- <div v-if="lojista?.instagram" class="instagram">
                            <v-icon color="purple">mdi-instagram</v-icon>
                            <span>@{{ lojista?.instagram }}</span>
                        </div> -->

            <!-- Contato -->
            <h3 class="section-title" v-if="lojista?.whatsapp">Contato</h3>

            <div class="buttons">
              <v-btn
                v-if="lojista?.whatsapp"
                variant="outlined"
                prepend-icon="mdi-whatsapp"
                :href="`https://wa.me/${lojista.whatsapp}`"
                target="_blank"
              >
                {{ lojista.whatsapp }}
              </v-btn>
            </div>

            <!-- Endereço -->
            <h3 class="section-title" v-if="lojista?.endereco">Endereço</h3>
            <p class="address">
              {{ lojista?.endereco?.rua }}, {{ lojista?.endereco?.numero }}<br />
              {{ lojista?.endereco?.bairro }}, {{ lojista?.endereco?.cidade }} -
              {{ lojista?.endereco?.estado }}
            </p>
          </div>
        </v-window-item>

        <!-- HORÁRIO -->
        <v-window-item value="horario">
          <v-list>
            <v-list-item
              v-for="dia in horarios"
              :key="dia.nome"
              :class="{ 'dia-atual': dia.isHoje }"
            >
              <v-list-item-title>
                {{ dia.nome }}
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ dia.horario }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-window-item>

        <!-- PAGAMENTO -->
        <v-window-item value="pagamento">
          <p>Aceitamos as seguintes formas de pagamento:</p>

          <v-row dense>
            <v-col v-for="(ativo, metodo) in lojista?.formasPagamento" :key="metodo" cols="6">
              <v-card class="payment-card" variant="outlined">
                <v-card-text class="d-flex align-center">
                  <v-icon class="mr-2">
                    {{
                      metodo === 'pix'
                        ? 'mdi-qrcode'
                        : metodo === 'cartaoCredito'
                          ? 'mdi-credit-card'
                          : metodo === 'cartaoDebito'
                            ? 'mdi-credit-card-outline'
                            : 'mdi-cash'
                    }}
                  </v-icon>

                  <span>
                    {{
                      metodo === 'cartaoCredito'
                        ? 'Crédito'
                        : metodo === 'cartaoDebito'
                          ? 'Débito'
                          : String(metodo).charAt(0).toUpperCase() + String(metodo).slice(1)
                    }}
                  </span>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-container>
</template>

<script lang="ts">
import logger from '@/plugins/logs'
import type { LojistaModel } from '@/services/lojistaService/LojistaModel'
import { LojistaService } from '@/services/lojistaService/LojistaService'

export default {
  name: 'SobreView',

  data() {
    return {
      tab: 'sobre',
      horarios: [] as Array<{ nome: string; index: number; horario: string; isHoje: boolean }>,
      lojista: null as LojistaModel | null,
    }
  },

  async mounted() {
    // Busca o ID do lojista pelo slug
    const estabelecimentoSlug = this.$route.query.estabelecimento as string
    const lojistaId = await this.getLojistaIdPorSlug(estabelecimentoSlug)

    if (!lojistaId) {
      throw new Error('Lojista não encontrado')
    }

    this.lojista = await this.getLojista(lojistaId)
    logger.info('Sobre o lojista carregado', {
      lojista: this.lojista,
    })

    this.montarHorarios()
  },
  methods: {
    voltar() {
      this.$router.back()
    },
    montarHorarios() {
      if (!this.lojista?.horarioFuncionamento) return

      const hoje = new Date().getDay()

      const mapaDias = [
        { key: 'domingo', nome: 'Domingo', index: 0 },
        { key: 'segunda', nome: 'Segunda-feira', index: 1 },
        { key: 'terca', nome: 'Terça-feira', index: 2 },
        { key: 'quarta', nome: 'Quarta-feira', index: 3 },
        { key: 'quinta', nome: 'Quinta-feira', index: 4 },
        { key: 'sexta', nome: 'Sexta-feira', index: 5 },
        { key: 'sabado', nome: 'Sábado', index: 6 },
      ]

      this.horarios = mapaDias.map((dia) => {
        const horario =
          this.lojista?.horarioFuncionamento?.[
            dia.key as keyof typeof this.lojista.horarioFuncionamento
          ]

        return {
          nome: dia.nome,
          index: dia.index,
          isHoje: dia.index === hoje,
          horario: horario ? `${horario.abertura} às ${horario.fechamento}` : 'Fechado',
        }
      })
    },
    async getLojistaIdPorSlug(slug: string): Promise<string | null> {
      try {
        const lojistaService = new LojistaService()
        return await lojistaService.getId_aPartirDaSlug(slug)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar lojista'
        throw new Error(errorMessage)
      }
    },
    async getLojista(lojaId: string) {
      try {
        const lojistaService = new LojistaService()
        return await lojistaService.getData(lojaId)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar lojista'
        throw new Error(errorMessage)
      }
    },
  },
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  flex: 1;
}

.content-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.instagram {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-weight: 500;
  color: #6b7280;
}

.section-title {
  align-self: flex-start;
  margin-top: 28px;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #1f1f1f;
}

.address {
  align-self: flex-start;
  text-align: left;
  color: #6b7280;
  line-height: 1.4;
}

/* ---------- BOTÕES ---------- */
.buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-start;
  /* eixo horizontal */
  align-self: flex-start;
}

.v-btn {
  border-radius: 10px;
  text-transform: none;
}

/* ---------- LOGO ---------- */
.img {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 110px;
  margin-top: 8px;
}

.avatar {
  width: 90px;
  height: 90px;
  padding: 6px;
  background: white;
}

/* ---------- TABS SIMPLES ---------- */
.simple-tabs {
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  padding: 14px 0;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  position: relative;
  color: #6b7280;
}

.tab.active {
  color: #1f1f1f;
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #ff7a00;
  /* cor delivery */
  border-radius: 2px;
}

/* ---------- PAGAMENTO ---------- */
.payment-card {
  border-radius: 12px;
  border-color: #e5e7eb;
}

.payment-card .v-card-text {
  font-weight: 500;
  color: #1f1f1f;
}

.v-list-item {
  border-bottom: 1px solid #e5e7eb;
  padding: 14px 16px;
}

.dia-atual {
  background-color: #fff7ed;
  /* laranja bem suave */
}

.dia-atual .v-list-item-title {
  font-weight: 600;
  color: #ff7a00;
}

.dia-atual .v-list-item-subtitle {
  color: #ff7a00;
}
</style>
