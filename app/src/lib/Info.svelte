<!-- Form providing information about the user -->

<script lang="ts">
    import { type ContactInfo } from "./types";

    let { update } = $props<{
        update: (l: ContactInfo | null) => void;
    }>();

    function submit_info(e: any) {
        e.preventDefault();

        update({
            name: e.target.name.value,
            info: e.target.info.value,
        });
    }
</script>

<main>
    <h2>Registration</h2>
    <p>
        Enter your information, and select your starting and ending locations!
    </p>
    <form onsubmit={submit_info} autocomplete="off">
        <input type="text" name="name" placeholder="Name" />
        <input
            type="text"
            name="info"
            placeholder="Useful info (# people, bags, etc.)"
        />
        <input type="submit" value="Submit" />
    </form>
</main>

<style>
    main {
        margin: 0;
        padding: 20px;
        background-color: #eeeeee;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    main h2 {
        font-size: 1.8rem;
        color: #333;
        margin-bottom: 10px;
    }

    main p {
        font-size: 1rem;
        color: #666;
        text-align: center;
        margin-bottom: 20px;
    }

    form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    form input[type="text"] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 1rem;
        box-sizing: border-box;
    }

    form input[type="submit"] {
        width: 100%;
        padding: 10px;
        background-color: var(--blue);
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    form input[type="submit"]:hover {
        background-color: var(--dark-blue);
    }
</style>
