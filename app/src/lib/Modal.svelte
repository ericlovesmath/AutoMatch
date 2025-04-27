<script>
  let showInfo = false;
</script>

<main>
    <button class="info-button" on:click={() => (showInfo = !showInfo)}>
      About
    </button>

    {#if showInfo}
      <div class="info-window">
        <p>
        Find people for rideshares. made by
        <a href="https://bradybhalla.github.io/">Brady Bhalla</a>
        and
        <a href="https://www.ericchanlee.com">Eric Lee</a>
        </p>
      </div>
    {/if}
</main>

<style>
  .info-button {
    position: fixed;
    bottom: 10px;
    left: 10px;
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 1000;
  }

  .info-button:hover {
    background-color: #0056b3;
  }

  /* Style for the info window */
  .info-window {
    position: fixed;
    bottom: 50px;
    left: 10px;
    width: 500px;
    padding: 15px;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .info-window p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: black;
  }

  .info-window button {
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .info-window button:hover {
    background-color: #c82333;
  }
</style>
