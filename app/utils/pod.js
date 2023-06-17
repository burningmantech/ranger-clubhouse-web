

export async function movePod(pod, direction) {
  const idx = this.pods.findIndex((p) => p.id === pod.id);
  const pods = this.pods.filter((p) => p.id !== pod.id);

  this.isSubmitting = true;

  if (direction < 0) {
    if (idx === 1) {
      pods.unshift(pod);
    } else if (idx > 0) {
      pods.splice(idx - 1, 0, pod);
    }
  } else {
    if (idx < (pods.length - 1)) {
      pods.splice(idx + 1, 0, pod);
    } else {
      pods.push(pod);
    }
  }

  for (let i = 0; i < pods.length; i++) {
    const sortIdx = i + 1;
    const p = pods[i];
    if (p.sort_index !== sortIdx) {
      try {
        p.sort_index = sortIdx;
        await p.save();
      } catch (response) {
        this.house.handleErrorResponse(response);
      }
    }
  }

  this.pods = pods;
  this.isSubmitting = false;
}
