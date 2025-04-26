<script lang="ts">
    import {
        type ContactInfo

    } from "./WebsocketStore";

    let {update} = $props<{
        update: (l: ContactInfo|null) => void;
    }>();

    function submit_info(e : any) {
        e.preventDefault();

        update({
            name: e.target.name.value,
            phone: e.target.phone.value,
        });
    }
</script>

<main>
<h2>Info collect</h2>
<p>Enter your information</p>
<form onsubmit={submit_info}>
    <input type="text" name="name" placeholder="Zack Huang" />
    <input type="text" name="phone" placeholder="(383) 783-9827" />
    <input type="submit" value="Submit" />
</form>
</main>
