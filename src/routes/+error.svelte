<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Error {$page.status}: {$page.error?.message}</title>
</svelte:head>

<h1>Error {$page.status}: {$page.error?.message}</h1>

<a href="/">Go back to book selector</a>

<style>
	h1 {
		color: red;
		font-size: 2em;
		text-align: center;
		padding-top: 10%;
	}

	a {
		display: block;
		width: 20em;
		height: 50px;
		margin: 20px auto;
		background-color: #4e9caf;
		text-align: center;
		border-radius: 10px;
		color: white;
		font-weight: bold;
		line-height: 50px;
		text-decoration: none;
	}
</style>
