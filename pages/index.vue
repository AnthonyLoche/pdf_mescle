<template>
  <v-app>
    <v-main class="home-main">
      <v-container class="page-shell px-4">
        <v-card class="home-card mx-auto" max-width="520" rounded="xl" elevation="8">
          <v-card-text class="pa-5 pa-sm-6">
            <div class="d-flex align-center mb-5">
              <v-avatar color="primary" size="40" class="me-3">
                <v-icon icon="mdi-file-pdf-box" size="22" />
              </v-avatar>
              <div>
                <h1 class="text-h6 font-weight-bold">Mesclar PDFs</h1>
                <p class="text-caption text-medium-emphasis">Envie, ordene e gere um unico arquivo.</p>
              </div>
            </div>

            <v-text-field
              v-model="outputName"
              label="Nome do PDF final"
              variant="outlined"
              density="comfortable"
              hint="Ex: contrato-final"
              persistent-hint
              class="mb-4"
            />

            <v-file-input
              accept="application/pdf,.pdf"
              label="Selecionar PDFs"
              variant="outlined"
              prepend-icon="mdi-paperclip"
              multiple
              show-size
              clearable
              :model-value="selectedFiles"
              @update:model-value="onFilesSelected"
            />

            <v-alert v-if="selectedFiles.length < 2" type="info" variant="tonal" class="mt-4">
              Selecione ao menos 2 PDFs para mesclar.
            </v-alert>

            <v-list v-else class="mt-4 rounded-lg order-list" density="compact">
              <v-list-item
                v-for="(file, index) in selectedFiles"
                :key="`${file.name}-${file.size}-${index}`"
                :title="`${index + 1}. ${file.name}`"
                :subtitle="formatFileSize(file.size)"
              >
                <template #append>
                  <div class="d-flex align-center ga-1">
                    <v-btn
                      icon="mdi-arrow-up"
                      variant="text"
                      size="small"
                      :disabled="index === 0"
                      @click="moveFile(index, -1)"
                    />
                    <v-btn
                      icon="mdi-arrow-down"
                      variant="text"
                      size="small"
                      :disabled="index === selectedFiles.length - 1"
                      @click="moveFile(index, 1)"
                    />
                    <v-btn
                      icon="mdi-close"
                      variant="text"
                      size="small"
                      color="error"
                      @click="removeFile(index)"
                    />
                  </div>
                </template>
              </v-list-item>
            </v-list>

            <div class="actions-wrap mt-6">
              <v-btn
                variant="tonal"
                color="error"
                size="large"
                class="action-btn"
                :disabled="isMerging || (selectedFiles.length === 0 && outputName === 'arquivo-mesclado')"
                @click="clearAll"
              >
                Limpar tudo
              </v-btn>

              <v-btn
                color="primary"
                size="large"
                class="action-btn"
                :loading="isMerging"
                :disabled="selectedFiles.length < 2 || isMerging"
                @click="mergePdfs"
              >
                Mesclar e baixar PDF
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <v-snackbar
      v-model="toast.show"
      :color="toast.color"
      location="bottom"
      timeout="3000"
    >
      {{ toast.message }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
const outputName = ref('arquivo-mesclado')
const selectedFiles = ref<File[]>([])
const isMerging = ref(false)
const toast = useState('merge-toast', () => ({
  show: false,
  message: '',
  color: 'error' as 'error' | 'success'
}))

function onFilesSelected(files: File[] | File | null) {
  if (!files) {
    selectedFiles.value = []
    return
  }

  selectedFiles.value = Array.isArray(files) ? files.filter(isPdf) : isPdf(files) ? [files] : []
}

function isPdf(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

function moveFile(index: number, direction: -1 | 1) {
  const targetIndex = index + direction

  if (targetIndex < 0 || targetIndex >= selectedFiles.value.length) {
    return
  }

  const files = [...selectedFiles.value]
  const [moved] = files.splice(index, 1)
  files.splice(targetIndex, 0, moved)
  selectedFiles.value = files
}

function removeFile(index: number) {
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index)
}

function clearAll() {
  selectedFiles.value = []
  outputName.value = 'arquivo-mesclado'

  toast.value = {
    show: true,
    message: 'Lista limpa com sucesso.',
    color: 'success'
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const kb = bytes / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }

  return `${(kb / 1024).toFixed(1)} MB`
}

function finalName() {
  const raw = outputName.value.trim()
  if (!raw) {
    return 'arquivo-mesclado.pdf'
  }

  return raw.toLowerCase().endsWith('.pdf') ? raw : `${raw}.pdf`
}

function showError(message: string) {
  toast.value = {
    show: true,
    message,
    color: 'error'
  }
}

async function mergePdfs() {
  if (selectedFiles.value.length < 2) {
    showError('Selecione ao menos 2 PDFs para continuar.')
    return
  }

  isMerging.value = true

  try {
    const formData = new FormData()

    formData.append('outputName', outputName.value)
    for (const file of selectedFiles.value) {
      formData.append('files', file)
    }

    const response = await fetch('/api/pdf/merge', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Erro ao mesclar os arquivos.')
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = finalName()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.value = {
      show: true,
      message: 'PDF mesclado com sucesso!',
      color: 'success'
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao mesclar os PDFs.'
    showError(message)
  } finally {
    isMerging.value = false
  }
}
</script>

<style scoped>
.home-main {
  background: linear-gradient(180deg, #f5f7ff 0%, #ffffff 60%, #eef4ff 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-shell {
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.home-card {
  width: 100%;
  border: 1px solid rgba(33, 150, 243, 0.14);
  backdrop-filter: blur(4px);
  box-shadow: 0 18px 40px rgba(26, 90, 180, 0.12) !important;
}

.order-list {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.actions-wrap {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  min-height: 46px;
}

.action-btn :deep(.v-btn__content) {
  font-weight: 700;
}

@media (max-width: 600px) {
  .home-main {
    align-items: flex-start;
  }

  .page-shell {
    min-height: 100vh;
    padding-top: 18px;
    padding-bottom: 24px;
  }

  .home-card {
    border-radius: 20px !important;
    box-shadow: 0 12px 28px rgba(20, 48, 100, 0.14) !important;
  }

  .actions-wrap {
    flex-direction: column;
  }

  .action-btn {
    min-height: 56px;
    border-radius: 14px !important;
  }

  .action-btn :deep(.v-btn__content) {
    font-size: 0.98rem;
    letter-spacing: 0.2px;
  }
}
</style>