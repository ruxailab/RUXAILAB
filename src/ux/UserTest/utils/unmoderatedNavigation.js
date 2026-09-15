export const taskDestination = ({
  taskIndex,
  taskCount,
  hasEyeTracking,
  hasPostTest,
  postTestCompleted,
}) => {
  if (taskIndex < taskCount - 1) {
    return { kind: 'task', taskIndex: taskIndex + 1 }
  }
  if (hasPostTest && !postTestCompleted) {
    return { kind: 'postTest', globalIndex: hasEyeTracking ? 6 : 5 }
  }
  return { kind: 'finish', globalIndex: hasEyeTracking ? 7 : 6 }
}
