<template>
    <h1>This is home. Nothing to see here.</h1>

    <h2>Bulma test</h2>
    <p class="mb-5">
        <button class="button is-primary">Hello Bulma</button>
    </p>

    <article class="media">
        <figure class="media-left">
            <p class="image is-64x64">
                <img src="https://bulma.io/assets/images/placeholders/128x128.png" alt="Placeholder" />
            </p>
        </figure>
        <div class="media-content">
            <div class="content">
                <p>
                    <strong>John Smith</strong> <small>@johnsmith</small> <small>31m</small>
                    <br />
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ornare
                    magna eros, eu pellentesque tortor vestibulum ut. Maecenas non massa
                    sem. Etiam finibus odio quis feugiat facilisis.
                </p>
            </div>
            <nav class="level is-mobile">
                <div class="level-left">
                    <a class="level-item">
                        <span class="icon is-small"><i class="fa fa-reply"></i></span>
                    </a>
                    <a class="level-item">
                        <span class="icon is-small"><i class="fa fa-retweet"></i></span>
                    </a>
                    <a class="level-item">
                        <span class="icon is-small"><i class="fa fa-heart"></i></span>
                    </a>
                </div>
            </nav>
        </div>
        <div class="media-right">
            <button class="delete"></button>
        </div>
    </article>
</template>

<style lang="scss" scoped>
article {
    $color: red;

    div {
        background: rgba($color, .25);
    }
}
</style>
