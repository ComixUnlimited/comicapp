import { fixCorsErrors } from 'fix-cors-errors'; 

export const URL = {
    base: fixCorsErrors("https://getcomics.info/page"),
    searchUri1: fixCorsErrors("https://getcomics.info/page"),
    searchUri2: "?s="
};

export const DC = {
    dcHome: fixCorsErrors("https://getcomics.info/cat/dc/page"),
    dcWeek: fixCorsErrors("https://getcomics.info/tag/dc-week/page"),
    dcVertigo: fixCorsErrors("https://getcomics.info/tag/vertigo/page"),
    dcWildstorm: fixCorsErrors("https://getcomics.info/tag/wildstorm/page")
};

export const Marvel = {
    marvelHome: fixCorsErrors("https://getcomics.info/cat/marvel/page")
};

export const otherComics = {
    europeComics: fixCorsErrors("https://getcomics.info/tag/europe-comics/page"),
    imageComics: fixCorsErrors("https://getcomics.info/tag/image-comics/page"),
    AD2000: fixCorsErrors("https://getcomics.info/tag/2000ad/page"),
    aftershockComics: fixCorsErrors("https://getcomics.info/tag/aftershock-comics/page"),
    antarticPress: fixCorsErrors("https://getcomics.info/tag/antartic-press/page"),
    archie: fixCorsErrors("https://getcomics.info/tag/archie/page"),
    avatarPress: fixCorsErrors("https://getcomics.info/tag/avatar-press/page"),
    aspen: fixCorsErrors("https://getcomics.info/tag/aspen/page"),
    blackMaskStudios: fixCorsErrors("https://getcomics.info/tag/black-mask-studio/page"),
    boomStudios: fixCorsErrors("https://getcomics.info/tag/boom-studios/page"),
    darkHorse: fixCorsErrors("https://getcomics.info/tag/boom-studios/page"),
    dynamiteEntertainment: fixCorsErrors("https://getcomics.info/tag/dynamite-entertainment/page"),
    idw: fixCorsErrors("https://getcomics.info/tag/idw/page"),
    lionForgeComics: fixCorsErrors("https://getcomics.info/tag/lion-forge-comics/page"),
    oniPress: fixCorsErrors("https://getcomics.info/tag/oni-press/page"),
    valiant: fixCorsErrors("https://getcomics.info/tag/valiant/page"),
    zenescope: fixCorsErrors("https://getcomics.info/tag/zenescope/page")
};
