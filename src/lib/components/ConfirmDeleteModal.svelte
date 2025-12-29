<script lang="ts">
  import { scale, fade } from "svelte/transition";
  import { backOut } from "svelte/easing";

  interface Props {
    open: boolean;
    title: string;
    message: string;
    onClose: () => void;
    children: import("svelte").Snippet;
  }

  let { open = $bindable(), title, message, onClose, children }: Props = $props();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    transition:fade={{ duration: 150 }}
    onclick={onClose}
    role="presentation"
  >
    <!-- Modal -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="card bg-base-100 shadow-soft-lg w-full max-w-md"
      transition:scale={{ start: 0.9, duration: 200, easing: backOut }}
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabindex="-1"
    >
      <div class="card-body">
        <h3 id="modal-title" class="card-title font-display text-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {title}
        </h3>

        <p class="text-neutral py-4">{message}</p>

        <div class="card-actions justify-end gap-2">
          <button type="button" class="btn btn-ghost" onclick={onClose}>
            Cancel
          </button>
          {@render children()}
        </div>
      </div>
    </div>
  </div>
{/if}
