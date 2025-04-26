<script lang="ts">
    let name_info : string;
    let contact_info : string;
</script>

<main class="popup">
  <div class="popup-content">
    <h2>Info collect</h2>
    <p>Enter your information</p>
    <input type="text" bind:value="{name_info}" placeholder="Zack Huang">
    <input type="text" bind:value="{contact_info}" placeholder="(383) 783-9827">
    <button>Submit</button>
  </div>
</main>

<style>
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* semi-transparent background */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000;
}

/* Inner popup box */
.popup-content {
  background: white;
  color: black;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
  text-align: center;
}
</style>
