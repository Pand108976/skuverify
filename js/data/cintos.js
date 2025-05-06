const cintos = [
        { sku: "689112", caixa: 1, imagem: "./images/cintos/689112.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/ca/en/men/belts-man-ca/double-gancini-belts/double-adjus-689112?srsltid=AfmBOora5agPBxS0szDVzsaZhz0M1NZn89fjHXw1QsB3uuYN4ntaJNGG" },
        { sku: "770738", caixa: 1, imagem: "./images/cintos/770738.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-770738?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        
        { sku: "770651", caixa: 2, imagem: "./images/cintos/770651.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/double-gancini-belts/double-adjus-770651?srsltid=AfmBOoqIZDPpQSCSZ2GJhU1o3FM5haoMs-ns-JD9LUIbsAEisLJDxkJw" },

        { sku: "771013", caixa: 3, imagem: "./images/cintos/771013.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/single-gancini-belts/sized-771013?srsltid=AfmBOooSdFBEzFu5nvUa2vaJhWonAw_uhWB2GdtbIf0xiZmMrvtPfazm" },
        { sku: "586940", caixa: 3, imagem: "./images/cintos/586940.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/eu/en/men/man-belts/reversible-and-adjustable-belt-586940--24?srsltid=AfmBOoqzEPRI6d2H5ziDFBkx-EOz1N7_QT0tRw6NHlKlte4ATVyWOJtz" },

        { sku: "694531", caixa: 4, imagem: "./images/cintos/694531.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-694531?srsltid=AfmBOopsnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "686658", caixa: 5, imagem: "./images/cintos/686658.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-686658?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "689134", caixa: 6, imagem: "./images/cintos/689134.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-689134?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "765787", caixa: 7, imagem: "./images/cintos/765787.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-765787?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "718382", caixa: 7, imagem: "./images/cintos/718382.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/square-belts/reversible-and-adjustable-gancini-belt-718382?srsltid=AfmBOorqcntGce-6tGhmDSqDN2Ah_lQn5yU06qzTXHim2i-kSU5TP0Wh" },
        { sku: "735830", caixa: 7, imagem: "./images/cintos/735830.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-735830?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "764187", caixa: 8, imagem: "./images/cintos/764187.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-764187?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "776323", caixa: 8, imagem: "./images/cintos/776323.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-776323?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "734227", caixa: 8, imagem: "./images/cintos/734227.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-734227?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "764796", caixa: 9, imagem: "./images/cintos/764796.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-764796?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "675158", caixa: 9, imagem: "./images/cintos/675158.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-675158?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "687611", caixa: 10, imagem: "./images/cintos/687611.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/aus/en/men/men-belts/double-gancini-belts/adjustable-and-reversible-gancini-buckle-belt-687611--24?srsltid=AfmBOoozeWh8sId3AHTOtCd3j3SJ9VHn7QQ0QiebJrW0scB23rGot-Jr" },
        { sku: "741409", caixa: 10, imagem: "./images/cintos/741409.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-741409?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "770567", caixa: 11, imagem: "./images/cintos/770567.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-770567?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "776307", caixa: 11, imagem: "./images/cintos/776307.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-776307?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "771976", caixa: 11, imagem: "./images/cintos/771976.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-771976?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "776632", caixa: 12, imagem: "./images/cintos/776632.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/square-belts/sized-776632?srsltid=AfmBOop3MlFjJkOi-zZhDhsYlbldGsAZbcRzr92NlzpBIiEYVwnHPWAF" },
        { sku: "780488", caixa: 12, imagem: "./images/cintos/780488.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-780488?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "766126", caixa: 13, imagem: "",  classe: "imagem-cintos", link: ""},
        { sku: "785878", caixa: 13, imagem: "",  classe: "imagem-cintos", link: ""},

        { sku: "781608", caixa: 14, imagem: "./images/cintos/781608.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-781608?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "694745", caixa: 15, imagem: "./images/cintos/694745.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-694745?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "708206", caixa: 15, imagem: "./images/cintos/708206.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-708206?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "686671", caixa: 15, imagem: "./images/cintos/686671.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/double-gancini-belts/double-adjus-686671?srsltid=AfmBOoom1HPoHoNF0XOC2uT7enX1fBBVaRfy4yDjqMnp6MWyPITe5e86" },

        { sku: "476361", caixa: 16, imagem: "./images/cintos/476361.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/reversible-and-adjustable-belt-476361--1?srsltid=AfmBOorUTmM3KO0V-QETmdDZa3E5A3GCtd9BSBpj9uOXG_GUX9XTCTMd" },

        { sku: "764151", caixa: 17, imagem: "./images/cintos/764151.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-764151?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        

        { sku: "780998", caixa: 19, imagem: "./images/cintos/780998.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-780998?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "764164", caixa: 19, imagem: "./images/cintos/764164.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-764164?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "780180", caixa: 20, imagem: "./images/cintos/780180.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/single-gancini-belts/sized-double-780180?srsltid=AfmBOoptgJz_6lzZIrqlvQv0Oo7FQhrf37lKYLRfj0ST_7TcPixWo_2C" },
        { sku: "770715", caixa: 20, imagem: "./images/cintos/770715.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-770715?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "644557", caixa: 21, imagem: "./images/cintos/644557.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-644557--1?srsltid=AfmBOopLmwHVk_Svsd6B15XSOM1rJze0p1J5_KrcuZUGhgTNI91A8JW9?srsltid=AfmBOopLmwHVk_Svsd6B15XSOM1rJze0p1J5_KrcuZUGhgTNI91A8JW9" },

        
        

        { sku: "749909", caixa: 23, imagem: "./images/cintos/749909.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-749909?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "765786", caixa: 24, imagem: "./images/cintos/765786.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-765786?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "784018", caixa: 25, imagem: "",  classe: "imagem-cintos", link: ""},
        { sku: "783694", caixa: 25, imagem: "",  classe: "imagem-cintos", link: ""},

        { sku: "759044", caixa: 26, imagem: "./images/cintos/759044.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/double-gancini-belts/reversible-and-adjustable-gancini-belt-759044?srsltid=AfmBOorTL1m3maRPtrbEy40vxiS_ERHzs94bdfSEL3hOkmOIVB5vPpxb" },

        { sku: "765787", caixa: 27, imagem: "./images/cintos/765787.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-765787?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "745872", caixa: 27, imagem: "./images/cintos/745872.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-745872?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "780045", caixa: 28, imagem: "./images/cintos/780045.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/mex/es/hombre/mx-cinturones/double-adjus-780045--5?srsltid=AfmBOooz_v00DfOiNm8Eqjeegv1788JbcNEB8SJY9qu3OR_OpSY-iwEt" },
        { sku: "781687", caixa: 28, imagem: "./images/cintos/781687.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-781687?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "770928", caixa: 29, imagem: "./images/cintos/770928.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-770928?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "694531", caixa: 29, imagem: "./images/cintos/694531.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-694531?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "781604", caixa: 30, imagem: "./images/cintos/781604.jpg",  classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-781604?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "780248", caixa: 30, imagem: "./images/cintos/780248.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/sized-780248?srsltid=AfmBOoqfR0KUWNzd5X17t9Zf2wArV5H69J0fukfbSVL3vYCthWROoxr0" },

        { sku: "780486", caixa: 31, imagem: "./images/cintos/780486.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-780486?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "776635", caixa: 31, imagem: "./images/cintos/776635.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-776635?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "709528", caixa: 31, imagem: "./images/cintos/709528.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-709528?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "697875", caixa: 31, imagem: "./images/cintos/697875.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/mex/es/hombre/mx-cinturones/hebilla-doble-gancini/double-adjus-697875--5?srsltid=AfmBOoorq3qdUMog7jXr_kHsVfpsXkvzn2IFoVFaQVvFsKxLsAxs2Xj2" },

        { sku: "675140", caixa: 32, imagem: "./images/cintos/675140.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-675140?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "764161", caixa: 33, imagem: "./images/cintos/764161.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-764161?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "705614", caixa: 33, imagem: "./images/cintos/705614.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-705614?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "758760", caixa: 34, imagem: "./images/cintos/758760.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-758760?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "724127", caixa: 34, imagem: "./images/cintos/724127.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/double-gancini-belts/adjustable-and-reversible-gancini-belt-724127?srsltid=AfmBOoomC1ujhk8d-YlRmASuPbNWus0zaUFupom_mVajPnZv-qxYs01V" },

        { sku: "780487", caixa: 35, imagem: "./images/cintos/780487.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/eu/en/men/man-wallets-small-leather-goods/man-belts/double-adjus-780487--24?srsltid=AfmBOooSC5ccOwbxMXfkJiD5jBwuFKqONznbCUBh8gxxCs5JSwWzd2dl" },
        { sku: "781607", caixa: 35, imagem: "./images/cintos/781607.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-781607?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "770654", caixa: 36, imagem: "./images/cintos/770654.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/eu/en/men/man-belts/double-gancini-belts-eu-en/double-adjus-770654--24?srsltid=AfmBOoqki2_JNHGMoxAQ9WPjT0X1OiKjmVxSpodurECag_oC9eQXgJWI" },

        { sku: "770682", caixa: 37, imagem: "./images/cintos/770682.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-770682?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "776300", caixa: 38, imagem: "",  classe: "imagem-cintos", link: ""},
        { sku: "776320", caixa: 38, imagem: "",  classe: "imagem-cintos", link: ""},

        { sku: "783693", caixa: 39, imagem: "",  classe: "imagem-cintos", link: ""},
        { sku: "783265", caixa: 39, imagem: "",  classe: "imagem-cintos", link: ""},
        { sku: "783264", caixa: 39, imagem: "",  classe: "imagem-cintos", link: ""},

        { sku: "771015", caixa: 40, imagem: "./images/cintos/771015.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/single-gancini-belts/sized-771015?srsltid=AfmBOop3KDWc0HXGzbWaeDv3kWQgubJrlT_TtMtE4e4w9iHPunSr1fki" },
        { sku: "746507", caixa: 40, imagem: "./images/cintos/746507.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-746507?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "770986", caixa: 40, imagem: "./images/cintos/770986.webp", classe: "imagem-cintos", link: "" },

        { sku: "759027", caixa: 41, imagem: "./images/cintos/759027.jpg",  classe: "imagem-cintos", link: "https://www.ferragamo.cn/productdetails/0759027?category=woman-shoes-sneakers" },

        { sku: "770936", caixa: 42, imagem: "./images/cintos/770936.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adju-770936?srsltid=AfmBOor-qa0QP8BEaLn2i41iuQibSUonJ13nXr1wEPx4VslIB15tb1ne" },

        { sku: "688772", caixa: 43, imagem: "./images/cintos/688772.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-688772?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        { sku: "770713", caixa: 43, imagem: "./images/cintos/770713.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-770713?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "776300", caixa: 44, imagem: "./images/cintos/776300.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/eu/en/men/man-belts/square-belts-eu-en/double-adjus-776300--24?srsltid=AfmBOoq-SoCnZvw0PjqmEhaNRPuDWemsqDvoaQJd2uc1FjdbMluZnN5F" },
        { sku: "593873", caixa: 44, imagem: "./images/cintos/593873.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/ca/en/women/wallets---small-leathers-goods/-593873--1?srsltid=AfmBOor2iG1InuUgC4S0TguHW-lG8tTuaK7ohdrziqVa6GnAQgE_pz-T" },
        { sku: "775596", caixa: 44, imagem: "./images/cintos/775596.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/women/wallets-small-leathers-goods/belts-woman/donna-h-25-775596?srsltid=AfmBOoqA4NYAa-l5WavLL7WmfIm4s7aJW8GMbHAEOmgK5gtsPI_IpnSH" },
        { sku: "773331", caixa: 44, imagem: "",  classe: "imagem-cintos", link: ""},

        { sku: "725421", caixa: 45, imagem: "./images/cintos/725421.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-725421?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },
        

        
        { sku: "770943", caixa: 47, imagem: "./images/cintos/770943.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/men/belts-man/detailed-buckle-belts/double-adjus-770943?srsltid=AfmBOopTnDvBvDyzl9vVF2G5XLnqoMst34rEpj795ZLGqHpBL7pULwvy" },

        { sku: "717550", caixa: 48, imagem: "./images/cintos/717550.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/women/wallets-small-leathers-goods/belts-woman/donna-h15-717550?srsltid=AfmBOorjtQqzWD2Pv-E4cQrQV8cUJsSXmcy9CEBwJUKKXshrxqvvXv-P" },
        { sku: "759448", caixa: 48, imagem: "./images/cintos/759448.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/women/wallets-small-leathers-goods/belts-woman/donna-h25-759448?srsltid=AfmBOopNhaD0gjDyCpnXAWMUYtOkM8_ZTkZclwg3PZBFHUWL5Et9Ww1q" },
        { sku: "780417", caixa: 48, imagem: "./images/cintos/780417.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/eu/en/women/wallets-small-leathers-goods/belts/donna-h-25-780417--24?srsltid=AfmBOopSQ4qMc8OlXl-4sQGF_I5xLeAkVnW1gHzvCDIOnaBInbHyBQqd" },
        { sku: "780428", caixa: 48, imagem: "./images/cintos/780428.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/women/wallets-small-leathers-goods/belts-woman/donna-h-25-780428?srsltid=AfmBOooFl3PzTEBgTsmfwXJ_uWmmuCUXr2TdXE3FcKd8heRcCm-WonNw" },

        { sku: "764045", caixa: 49, imagem: "./images/cintos/764045.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/aus/en/women/women-wallets-small-leather-goods/women-belts/donna-h25-764045--24?srsltid=AfmBOopE8CFfJc0tvjR-yfibJRhjT0xmjJFayPefBjDSF6Sz7MBz216s" },
        { sku: "771067", caixa: 49, imagem: "./images/cintos/771067.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/women/wallets-small-leathers-goods/belts-woman/donna-h-25-771067?srsltid=AfmBOoqE18joPF3uTP1xO1sZtocWNwCrp762VfFIi3jd2F_8pxIUFezm" },
        { sku: "615288", caixa: 49, imagem: "./images/cintos/615288.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/women/wallets-small-leathers-goods/belts-woman/-615288--1?srsltid=AfmBOoqahnw2Y3H6K81fKzb7-Cdx2S7P_r54PkJ9R_HF7CkbiSL-sIoI" },

        { sku: "780415", caixa: 50, imagem: "./images/cintos/780415.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/eu/en/women/wallets-small-leathers-goods/belts/donna-h-25-780415--24?srsltid=AfmBOoovIWBmS_AxcgSV1IcNXk9_dVY3St2jt-X01zB6tNSzUl632hEm" },
        { sku: "771068", caixa: 50, imagem: "./images/cintos/771068.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/women/wallets-small-leathers-goods/belts-woman/donna-h-25-771068?srsltid=AfmBOop1dRSLh29HCwzILgWGwceFBSjecN1xdK_PCHRWmqqGwK72Aenf" },
        { sku: "780502", caixa: 50, imagem: "./images/cintos/780502.jpg",  classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/mex/es/mujer/accesorios-piel/cinturones/donna-h-25-780502--5?srsltid=AfmBOorIVu3DGbgQJVVMEa1JHHMLof_vBi47NYeqgr2vv91PFzO2MwX4" },
        { sku: "764083", caixa: 50, imagem: "./images/cintos/764083.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/eu/en/women/wallets-small-leathers-goods/donna-h25-764083--24?srsltid=AfmBOoqSCOxssQ5tFqUuMmpEPuX9Lb1ATGMZ4Q23UpfNjqiX5ImCVirs" },

        { sku: "674556", caixa: 51, imagem: "./images/cintos/674556.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/women/wallets-small-leathers-goods/belts-woman/medium-double-gancio-belt-674556?srsltid=AfmBOor2bSWp0FfImQIpi8mkn_LnhsslpQLGY51kh-YOJI36sxSrUOk4" },
        { sku: "715735", caixa: 51, imagem: "./images/cintos/715735.webp", classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/ca/en/women/wallets---small-leathers-goods/belts-woman-ca/verstellbarer-gancini-g%C3%BCrtel-715735?srsltid=AfmBOoquva7Y7ezTqZXaqb7wPsbagUyQyu9iggMNhyQ-LIdd_-HjL9aV" },
        { sku: "780503", caixa: 51, imagem: "./images/cintos/780503.jpg",  classe: "imagem-cintos", link: "https://www.ferragamo.com/shop/us/en/women/wallets-small-leathers-goods/belts-woman/donna-h-25-780503?srsltid=AfmBOoqVZEMIGpgJs_VDc72f3-sUX8Nmh_k83PElpP2HB7gMLdPSAAZD"},
        
        { sku: "781219", caixa: 52, imagem: "",  classe: "imagem-cintos", link: ""},
        { sku: "783172", caixa: 52, imagem: "",  classe: "imagem-cintos", link: ""},
        { sku: "780047", caixa: 52, imagem: "",  classe: "imagem-cintos", link: ""},

        { sku: "780999", caixa: 53, imagem: "",  classe: "imagem-cintos", link: ""},
        { sku: "780459", caixa: 53, imagem: "",  classe: "imagem-cintos", link: ""},

];
