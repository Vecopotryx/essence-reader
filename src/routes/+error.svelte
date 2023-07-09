<script>
    import { page } from '$app/stores';
</script>

<h1>Error {$page.status}: {$page.error?.message}</h1>

<a href="/">Go back to book selector</a>