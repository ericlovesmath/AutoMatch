<script lang="ts">
    import type { ClientData } from "../../../shared/types";

    let { matched, send_consent } = $props<{
        matched: ClientData | null;
        send_consent: (consent: boolean) => void;
    }>();
</script>

<main id="matching-screen">
  <h2>Matching</h2>

  <div id="match-container">
    {#if matched}
      <p>
          Found match!
          <br><br>
          <strong>Name:</strong> {matched.name}
          <br>
          <strong>Description:</strong> {matched.info}
      </p>
      <div class="button-group">
        <button class="accept-btn" onclick={() => send_consent(true)}>Send Consent</button>
        <button class="reject-btn" onclick={() => send_consent(false)}>Reject Consent</button>
      </div>
    {:else}
      <p>Looking for a match...</p>
      <div class="loading-spinner"></div>
    {/if}
  </div>
</main>

<style>

/* General styles for the main container */
main {
  margin: 0;
  padding: 20px;
  background-color: #EEEEEE;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: black;
}

/* Heading styles */
main h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 20px;
}

/* Match container styles */
#match-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 20px;
}

/* Loading spinner styles */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ccc; /* Light gray border */
  border-top: 4px solid #007BFF; /* Blue border for animation */
  border-radius: 50%;
  animation: spin 1s linear infinite; /* Spinning animation */
}

/* Spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Button group styles */
.button-group {
  display: flex;
  gap: 15px;
}

/* Accept button styles */
.accept-btn {
  padding: 10px 20px;
  background-color: #28a745; /* Green background */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* Accept button hover effect */
.accept-btn:hover {
  background-color: #218838; /* Darker green */
}

/* Reject button styles */
.reject-btn {
  padding: 10px 20px;
  background-color: #dc3545; /* Red background */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* Reject button hover effect */
.reject-btn:hover {
  background-color: #c82333; /* Darker red */
}
</style>
