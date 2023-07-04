<template>
   <div id="App">
      <NuxtPage />
   </div>
</template>


<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');


* {
   margin: 0;
   padding: 0;
   box-sizing: border-box;
   font-family: 'Open Sans', sans-serif;

   -webkit-font-smoothing: antialiased;
   -moz-osx-font-smoothing: grayscale;
}

.ContainerCard {
   background: rgba(245, 245, 255, 0.025);
   border: 1px solid rgba(245, 245, 255, 0.05);

   transition: background 0.25s;

   &:hover {
      background: rgba(245, 245, 255, 0.04);
      border: 1px solid rgba(245, 245, 255, 0.065);
   }
}

#App {
   height: 100vh;
   width: 100vw;

   background: rgb(15, 15, 20);
   background: -moz-linear-gradient(180deg, rgba(15, 15, 20, 1) 10%, rgba(5, 20, 52, 1) 500%);
   background: -webkit-linear-gradient(180deg, rgba(15, 15, 20, 1) 10%, rgba(5, 20, 52, 1) 500%);
   background: linear-gradient(180deg, rgba(15, 15, 20, 1) 10%, rgba(5, 20, 52, 1) 500%);
   filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#0a0a0a", endColorstr="#020b34", GradientType=1);

   color: white;
}
</style>