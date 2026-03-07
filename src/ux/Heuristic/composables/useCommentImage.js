import { ref, computed, watch, onMounted } from 'vue'

export function useCommentImage(props, emit) {
  const show = ref(false)
  const newCommentText = ref('')
  const editingCommentId = ref(null)
  const editingCommentText = ref('')
  const imagePreviewDialog = ref(false)
  const previewImageUrl = ref('')
  const localComments = ref([])
  const localImages = ref([])

  const updateLocalComments = (answerHeu) => {
    const comments = []
    if (Array.isArray(answerHeu?.comments)) {
      comments.push(...answerHeu.comments)
    }
    if (comments.length === 0 && answerHeu?.heuristicComment?.trim()) {
      comments.push({ id: 'legacy', text: answerHeu.heuristicComment, createdAt: 0 })
    }
    localComments.value = comments
  }

  const updateLocalImages = (answerHeu) => {
    const images = []
    if (Array.isArray(answerHeu?.images)) {
      images.push(...answerHeu.images)
    }
    if (images.length === 0 && answerHeu?.answerImageUrl?.trim()) {
      images.push({ id: 'legacy', url: answerHeu.answerImageUrl, createdAt: 0 })
    }
    localImages.value = images
  }

  watch(() => props.answerHeu, (newVal) => {
    updateLocalComments(newVal)
    updateLocalImages(newVal)
  }, { deep: true, immediate: true })

  watch(() => props.answerHeu?.comments, () => updateLocalComments(props.answerHeu), { deep: true })
  watch(() => props.answerHeu?.images, () => updateLocalImages(props.answerHeu), { deep: true })

  const allComments = computed(() => localComments.value)
  const allImages = computed(() => localImages.value)
  const hasContent = computed(() => allComments.value.length > 0 || allImages.value.length > 0)
  const totalItemCount = computed(() => allComments.value.length + allImages.value.length)

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const addNewComment = () => {
    if (!newCommentText.value?.trim()) return
    const commentText = newCommentText.value.trim()
    const newComment = { id: `temp-${Date.now()}`, text: commentText, createdAt: Date.now() }
    localComments.value = [...localComments.value, newComment]
    emit('addComment', commentText)
    if (localComments.value.length === 1) emit('updateComment', commentText)
    newCommentText.value = ''
  }

  const startEditComment = (comment) => {
    editingCommentId.value = comment.id
    editingCommentText.value = comment.text
  }

  const cancelEditComment = () => {
    editingCommentId.value = null
    editingCommentText.value = ''
  }

  const saveEditComment = (commentId, index) => {
    if (!editingCommentText.value?.trim()) return
    const newText = editingCommentText.value.trim()
    localComments.value = localComments.value.map((c) =>
      c.id === commentId ? { ...c, text: newText, updatedAt: Date.now() } : c
    )
    emit('updateCommentById', commentId, newText)
    if (index === 0) emit('updateComment', newText)
    cancelEditComment()
  }

  const removeComment = (commentId, index) => {
    localComments.value = localComments.value.filter((c) => c.id !== commentId)
    emit('removeComment', commentId)
    if (index === 0) {
      const nextComment = localComments.value.length > 0 ? localComments.value[0]?.text : ''
      emit('updateComment', nextComment || '')
    }
  }

  const handleImageUploaded = (imageUrl) => {
    if (imageUrl) {
      const newImage = { id: `temp-${Date.now()}`, url: imageUrl, createdAt: Date.now() }
      localImages.value = [...localImages.value, newImage]
      emit('addImage', imageUrl)
      if (localImages.value.length === 1) emit('updateImage', imageUrl)
    }
  }

  const removeImage = (imageId, index) => {
    localImages.value = localImages.value.filter((i) => i.id !== imageId)
    emit('removeImage', imageId)
    if (index === 0) {
      const nextImage = localImages.value.length > 0 ? localImages.value[0]?.url : ''
      emit('updateImage', nextImage || '')
    }
  }

  const openImagePreview = (url) => {
    previewImageUrl.value = url
    imagePreviewDialog.value = true
  }

  watch(() => props.heurisIndex, () => {
    show.value = false
    cancelEditComment()
    newCommentText.value = ''
  })

  watch(() => props.answerHeu, () => {
    if (hasContent.value && !show.value) show.value = true
  }, { deep: true, immediate: true })

  onMounted(() => {
    if (hasContent.value) show.value = true
  })

  return {
    show, newCommentText, editingCommentId, editingCommentText,
    imagePreviewDialog, previewImageUrl, allComments, allImages,
    hasContent, totalItemCount, formatDate, addNewComment,
    startEditComment, cancelEditComment, saveEditComment,
    removeComment, handleImageUploaded, removeImage, openImagePreview
  }
}
