import { ref, computed, watch, onMounted } from 'vue'

export function useCommentImage(props, emit) {
  const show = ref(false)
  const newCommentText = ref('')
  const editingCommentId = ref(null)
  const editingCommentText = ref('')
  const imagePreviewDialog = ref(false)
  const previewImageUrl = ref('')
  const previewMediaType = ref('')
  const localComments = ref([])
  const localImages = ref([])
  const suppressDraftUpdate = ref(false)

  const usesDraftComment = computed(
    () => props.openByDefault && props.showComments,
  )

  const updateLocalComments = (answerHeu) => {
    const comments = []
    if (Array.isArray(answerHeu?.comments)) {
      comments.push(...answerHeu.comments)
    }
    if (
      !usesDraftComment.value &&
      comments.length === 0 &&
      answerHeu?.heuristicComment?.trim()
    ) {
      comments.push({
        id: 'legacy',
        text: answerHeu.heuristicComment,
        createdAt: 0,
      })
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

  watch(
    () => props.answerHeu,
    (newVal) => {
      updateLocalComments(newVal)
      updateLocalImages(newVal)
      if (usesDraftComment.value) {
        newCommentText.value = newVal?.heuristicComment || ''
      }
    },
    { deep: true, immediate: true },
  )

  watch(
    () => props.answerHeu?.comments,
    () => updateLocalComments(props.answerHeu),
    { deep: true },
  )
  watch(
    () => props.answerHeu?.images,
    () => updateLocalImages(props.answerHeu),
    { deep: true },
  )

  const allComments = computed(() => localComments.value)
  const allImages = computed(() => localImages.value)
  const hasContent = computed(
    () => allComments.value.length > 0 || allImages.value.length > 0,
  )
  const totalItemCount = computed(
    () => allComments.value.length + allImages.value.length,
  )

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
  }

  const addNewComment = () => {
    if (!newCommentText.value?.trim()) return
    const commentText = newCommentText.value.trim()
    const newComment = {
      id: `temp-${Date.now()}`,
      text: commentText,
      createdAt: Date.now(),
    }
    localComments.value = [...localComments.value, newComment]
    emit('addComment', commentText, props.heurisIndex, props.questionIndex)
    if (localComments.value.length === 1) {
      emit('updateComment', commentText, props.heurisIndex, props.questionIndex)
    }
    suppressDraftUpdate.value = true
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
      c.id === commentId ? { ...c, text: newText, updatedAt: Date.now() } : c,
    )
    emit(
      'updateCommentById',
      commentId,
      newText,
      props.heurisIndex,
      props.questionIndex,
    )
    if (index === 0) {
      emit('updateComment', newText, props.heurisIndex, props.questionIndex)
    }
    cancelEditComment()
  }

  const removeComment = (commentId, index) => {
    localComments.value = localComments.value.filter((c) => c.id !== commentId)
    emit('removeComment', commentId, props.heurisIndex, props.questionIndex)
    if (index === 0) {
      const nextComment =
        localComments.value.length > 0 ? localComments.value[0]?.text : ''
      emit(
        'updateComment',
        nextComment || '',
        props.heurisIndex,
        props.questionIndex,
      )
    }
  }

  const handleImageUploaded = (
    imageUrl,
    metadata = {},
    sourceHeurisIndex = props.heurisIndex,
    sourceQuestionIndex = props.questionIndex,
  ) => {
    if (imageUrl) {
      const newImage = {
        id: imageUrl,
        url: imageUrl,
        createdAt: Date.now(),
        ...metadata,
      }
      localImages.value = [...localImages.value, newImage]
      emit('addImage', imageUrl, metadata, sourceHeurisIndex, sourceQuestionIndex)
      if (localImages.value.length === 1) {
        emit('updateImage', imageUrl, sourceHeurisIndex, sourceQuestionIndex)
      }
    }
  }

  const removeImage = (imageId, index) => {
    localImages.value = localImages.value.filter((i) => i.id !== imageId)
    emit('removeImage', imageId, props.heurisIndex, props.questionIndex)
    if (index === 0) {
      const nextImage =
        localImages.value.length > 0 ? localImages.value[0]?.url : ''
      emit(
        'updateImage',
        nextImage || '',
        props.heurisIndex,
        props.questionIndex,
      )
    }
  }

  const isVideoMedia = (media) => media?.type?.startsWith('video/')

  const clearDraftComment = () => {
    suppressDraftUpdate.value = false
    localComments.value.forEach((comment) => {
      emit('removeComment', comment.id, props.heurisIndex, props.questionIndex)
    })
    localComments.value = []
    newCommentText.value = ''
    emit('updateComment', '', props.heurisIndex, props.questionIndex)
  }

  const openImagePreview = (media) => {
    previewImageUrl.value = media?.url || media
    previewMediaType.value = media?.type || ''
    imagePreviewDialog.value = true
  }

  watch(
    () => props.heurisIndex,
    () => {
      show.value = Boolean(props.openByDefault)
      cancelEditComment()
    },
  )

  watch(newCommentText, (text) => {
    if (!usesDraftComment.value) return
    if (suppressDraftUpdate.value) {
      suppressDraftUpdate.value = false
      return
    }
    emit('updateComment', text || '', props.heurisIndex, props.questionIndex)
  })

  watch(
    () => props.answerHeu,
    () => {
      if (props.openByDefault) {
        show.value = true
        return
      }
      if (hasContent.value && !show.value) show.value = true
    },
    { deep: true, immediate: true },
  )

  onMounted(() => {
    if (props.openByDefault) {
      show.value = true
      return
    }
    if (hasContent.value) show.value = true
  })

  return {
    show,
    newCommentText,
    editingCommentId,
    editingCommentText,
    imagePreviewDialog,
    previewImageUrl,
    previewMediaType,
    allComments,
    allImages,
    hasContent,
    totalItemCount,
    formatDate,
    addNewComment,
    startEditComment,
    cancelEditComment,
    saveEditComment,
    removeComment,
    handleImageUploaded,
    removeImage,
    openImagePreview,
    isVideoMedia,
    clearDraftComment,
  }
}
