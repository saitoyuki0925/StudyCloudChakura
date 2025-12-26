import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({

  // 要素セレクタへのグローバルCSSはここ
  globalCss: {    

    'html, body': {
      bg: 'gray.100', // = background
      color: 'gray.800',
      maxWidth: "80%",
      margin: "30px auto"
    },
    "button": {
      cursor: "pointer",
      _hover: {
        opacity: 0.8
      }
    }
  },
});

export const theme = createSystem(defaultConfig, config);

