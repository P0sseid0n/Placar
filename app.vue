<template>
   <div id="App">
      <NuxtPage />
   </div>
</template>


<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');

/* width */
::-webkit-scrollbar {
   width: 8px;
}

/* Track */
::-webkit-scrollbar-track {
   background: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
   background: rgba(245, 245, 250, 0.2);
   border-radius: 40px;

   &:hover {
      background: rgba(245, 245, 250, 0.4);
   }
}


* {
   margin: 0;
   padding: 0;
   box-sizing: border-box;
   font-family: 'Open Sans', sans-serif;

   -webkit-font-smoothing: antialiased;
   -moz-osx-font-smoothing: grayscale;
}

.ContainerCard {
   background: rgba(245, 245, 255, 0.03);
   border: 1px solid rgba(245, 245, 255, 0.06);

   transition: background 0.25s;

   &:hover {
      background: rgba(245, 245, 255, 0.07);
      border: 1px solid rgba(245, 245, 255, 0.1);
   }
}

#App {
   height: 100vh;
   width: 100vw;

   background: rgb(15, 15, 20);

   color: white;
}

#App>div>header,
#App>div>div>header {
   height: 128px;

   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 0 3%;

   h1 {
      font-size: 40px;
      font-weight: 700;
   }

   a,
   button {
      text-decoration: none;
      color: white;
      cursor: pointer;

      height: 40px;
      padding: 0 32px;
      display: inline-flex;

      border-radius: 8px;
   }

   >div {
      flex: 1;

      &:last-of-type {
         text-align: right;
         justify-content: flex-end;
      }

   }

   a,
   button,
   >div:has(> span) {
      align-items: center;
      justify-content: center;
      gap: 8px;

      font-size: 24px;

      span {
         font-size: 16px;
      }
   }

   >div:has(> span) {
      display: flex;

      span {
         opacity: 0.5;
      }
   }
}
</style>