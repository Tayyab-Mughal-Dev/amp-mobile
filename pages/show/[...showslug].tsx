import * as React from 'react';

import {
  AD_CODES,
  LOCALSTORAGE_KEY_CONSTANTS,
  contextParamsForREAnalytics,
  device_UUID,
  getLocalStorageData,
  getPreferredLanguages,
  getPreferredProviders,
  getUserType,
  sortProvidersByUserPreference,
} from '../../utils/constants';
import {
  CastAndCrew,
  CriticsReview,
  CriticsUsersReviewMobile,
  Episodes,
  MovieDescription,
  PhotoThumbnail,
  TopNews,
  TrailerAndVideos,
  UserReview,
  WhereToWatch,
} from '../../components/MovieShowDetails/MovieShowDetailsComponent';
import { Grid, Hidden } from '@material-ui/core';
import { NavBar, PagePath, Spinner, TopHeader } from '../../components';
import { getWebpUrl, removeAllHTMLTags } from '../../utils/helper';

import GoogleAdOttPlay from '../../components/GoogleAds';
import Helmet from 'react-helmet';
import { SEO } from '../../components/Seo/Seo';
import { SimilarMovie } from '../../components/SimilarMovie';
import { Theme } from '@material-ui/core/styles';
import { TrailerById } from '../../components/TrailerById';
import { ViewportContext } from '../../components/ViewportProvider';
import { WebPageSchema } from '../../components/Seo/SeoSchema';
import { WebfoxContext } from '../../services/webfox';
import cookie from 'react-cookies';
import { firebaseAnalytics } from '../../components/firebaseConfig';
import { getMoviesList } from '../../services/webbase/queries';
import { makeStyles } from '@material-ui/styles';
import { useRouter } from 'next/router';
import webfox from '../../services/webbase';

const windowAny: any = typeof window !== 'undefined' && window;
export default function MovieShowDetails({
  staticShowProps,
  location,
  ...props
}) {
  const router = useRouter();
  const classes = useStyles();
  const [results, setResults] = React.useState<any[]>([]);
  const [loadingData, setLoadingData] = React.useState(true);
  const [similar, setSimilar] = React.useState<any[]>([]);
  const [episodes, setEpisodes] = React.useState<any[]>([]);
  const [selectedView, setSelectedView] = React.useState(1);
  const [filteredEpisodes, setFilteredEpisodes] = React.useState<any[]>([]);
  const [similarName, setSimilarName] = React.useState('');
  const [criticsReview, setCriticsReview] = React.useState<any[]>([]);
  const _ht_clientid = cookie.load('_ht_clientid');
  const {
    webfox,
    actions,
    webstore,
    actionDispatch,
    setLoading,
  } = React.useContext(WebfoxContext);
  const { languages, streamingServices } = webstore;
  const languagesArr: any = getLocalStorageData(
    JSON.parse(
      typeof window !== 'undefined' &&
        localStorage.getItem(LOCALSTORAGE_KEY_CONSTANTS.LANGUAGE_NAMES)
    ) || [],
    languages.name || []
  );
  const providersArr: any = getLocalStorageData(
    JSON.parse(
      typeof window !== 'undefined' &&
        localStorage.getItem(LOCALSTORAGE_KEY_CONSTANTS.PROVIDER_IDS)
    ) || [],
    streamingServices.selectedStreamingServices || []
  );
  const providersNameArr: any = getLocalStorageData(
    JSON.parse(
      typeof window !== 'undefined' &&
        localStorage.getItem(LOCALSTORAGE_KEY_CONSTANTS.PROVIDER_NAMES)
    ) || [],
    streamingServices.name || []
  );
  const seoId =
    typeof window !== 'undefined' && window.location.pathname.split('/');
  const seoKey =
    seoId[1] === 'movie'
      ? typeof window !== 'undefined' && window.location.pathname.slice(7)
      : seoId[1] === 'web-series'
      ? typeof window !== 'undefined' && window.location.pathname.slice(12)
      : seoId[1] === 'tv-shows'
      ? typeof window !== 'undefined' && window.location.pathname.slice(10)
      : typeof window !== 'undefined' && window.location.pathname.slice(6);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const params = {
      id: seoId[3],
    };

    const query = {
      seoUrl: seoKey,
    };
    //console.log("staticShowProps query", query);
    {
      seoId[1] === 'movie' || seoId[1] === 'Movie'
        ? webfox.getMoviesDetailsList(query).then(({ data, error }) => {
            if (error) {
              actionDispatch(actions.FETCH_MOVIES_DETAILS_LIST_FAILURE, []);
            }
            actionDispatch(
              actions.FETCH_MOVIES_DETAILS_LIST_SUCCESS,
              data || []
            );
            if (data && data.movies) {
              const res = data.movies.filter((item) => {
                return seoKey === item.seo_url;
              });
              if (res.length > 0 && res[0] && res[0]['reviews']) {
                setCriticsReview(
                  res.length > 0 && res[0] && res[0]['reviews']
                    ? res[0]['reviews']
                    : '0'
                );
              }

              //setResults(res);
              setLoadingData(false);
              setSimilarName(
                data &&
                  data.movies &&
                  data.movies.length > 0 &&
                  data.movies[0].name
                  ? data.movies[0].name
                  : ''
              );
              firebaseAnalytics.logEvent('movieShowDetails', {
                screen_view:
                  '/movieDetails' +
                  (data && data.movies && data.movies[0] && data.movies[0].name
                    ? '/' + data.movies[0].name
                    : '') +
                  (data &&
                  data.movies[0] &&
                  data.movies[0].primary_language &&
                  data.movies[0].primary_language !== undefined &&
                  data.movies[0].primary_language.name
                    ? '/' + data.movies[0].primary_language.name
                    : '') +
                  (data &&
                  data.movies &&
                  data.movies[0] &&
                  data.movies[0].genres
                    ? '/' + data.movies[0].genres
                    : '') +
                  (data && data.movies && data.movies[0] && data.movies[0]._id
                    ? '/' + data.movies[0]._id
                    : '') +
                  (location && location.state && location.state.source
                    ? '/' + location.state.source
                    : '') +
                  '/' +
                  getUserType(_ht_clientid ? true : false) +
                  '/' +
                  getPreferredLanguages(languagesArr) +
                  '/' +
                  getPreferredProviders(providersArr) +
                  '/' +
                  _ht_clientid
                    ? _ht_clientid
                    : device_UUID,
              });
              windowAny.Moengage?.track_event('movieShowDetails', {
                screen_view: '/movieDetails',
                name:
                  data && data.movies && data.movies[0] && data.movies[0].name
                    ? data.movies[0].name
                    : '',
                primary_language:
                  data &&
                  data.movies[0] &&
                  data.movies[0].primary_language &&
                  data.movies[0].primary_language !== undefined &&
                  data.movies[0].primary_language.name
                    ? data.movies[0].primary_language.name
                    : '',
                genre:
                  data && data.movies && data.movies[0] && data.movies[0].genres
                    ? '/' + data.movies[0].genres
                    : '',
                id:
                  data && data.movies && data.movies[0] && data.movies[0]._id
                    ? '/' + data.movies[0]._id
                    : '',
                source:
                  location && location.state && location.state.source
                    ? '/' + location.state.source
                    : '',
                userType: getUserType(_ht_clientid ? true : false),
                preferredLanguages: getPreferredLanguages(languagesArr),
                preferredProviders: getPreferredProviders(providersArr),
                user_unique_id: _ht_clientid ? _ht_clientid : device_UUID,
              });
            }
          })
        : webfox.getShowDetailsList(query).then(({ data, error }) => {
            if (error) {
              actionDispatch(actions.FETCH_SHOWS_DETAILS_LIST_FAILURE, []);
            }
            actionDispatch(
              actions.FETCH_SHOWS_DETAILS_LIST_SUCCESS,
              data || []
            );
            if (data && data.shows) {
              const res = data.shows.filter((item) => {
                return seoKey === item.seo_url;
              });
              // data.shows.map((show) => {
              //   show.movie_id = show.show_id;
              //   delete show.show_id;
              //   show.similarShows.map((show) => {
              //     show.movie_id = show.show_id;
              //     delete show.show_id;
              //   });
              // });

              setResults(res);
              setLoadingData(false);
              setSimilarName(data && data.shows[0] && data.shows[0].name);
              firebaseAnalytics.logEvent('screen_view', {
                page_title:
                  '/showDetails' +
                  (data && data.shows && data.shows[0] && data.shows[0].name
                    ? '/' + data.shows[0].name
                    : '') +
                  (data &&
                  data.shows[0] &&
                  data.shows[0].primary_language &&
                  data.shows[0].primary_language !== undefined &&
                  data.shows[0].primary_language.name
                    ? '/' + data.shows[0].primary_language.name
                    : ''),
                page_location:
                  '/showDetails' +
                  (data &&
                  data.shows &&
                  data.shows[0] &&
                  data.shows[0].genres.length > 0
                    ? '/' + data.shows[0].genres.map((e) => e.name).toString()
                    : '') +
                  (data.shows && data.shows[0] && data.shows[0].release_year
                    ? '/' + data.shows[0].release_year
                    : '') +
                  (data && data.shows && data.shows[0] && data.shows[0]._id
                    ? '/' + data.shows[0]._id
                    : '') +
                  `${sessionStorage.getItem('prevPath')}`,
              });
              windowAny.Moengage?.track_event('screen_view', {
                page_title: '/showDetails',
                name:
                  data && data.shows && data.shows[0] && data.shows[0].name
                    ? data.shows[0].name
                    : '',
                primary_language:
                  data &&
                  data.shows[0] &&
                  data.shows[0].primary_language &&
                  data.shows[0].primary_language !== undefined &&
                  data.shows[0].primary_language.name
                    ? data.shows[0].primary_language.name
                    : '',
                genre:
                  data && data.shows && data.shows[0] && data.shows[0].genres
                    ? '/' + data.shows[0].genres
                    : '',
                id:
                  data && data.shows && data.shows[0] && data.shows[0]._id
                    ? '/' + data.shows[0]._id
                    : '',
                source:
                  location && location.state && location.state.source
                    ? '/' + location.state.source
                    : '',
              });
            }
          });
    }

    // const query = {
    //   query: data,
    // };

    webfox.episodeList(query).then(({ data, error }) => {
      if (error) {
        actionDispatch(actions.FETCH_EPISODE_LIST_FAILURE, []);
      }
      actionDispatch(actions.FETCH_EPISODE_LIST_SUCCESS, data || []);
      if (data && data.episodes) {
        const newResult = data.episodes.map((v) =>
          Object.assign(v, {
            air_date: v.air_date && new Date(v.air_date).toDateString(),
          })
        );
        setEpisodes(newResult);
        //setSelectedView(data.episodes && data.episodes[0].season_number);
        setFilteredEpisodes(
          data.episodes.filter((data) => data.season_number == selectedView)
        );
      }

      setLoadingData(false);
    });

    const criticsReview = {
      seoUrl: seoKey,
    };

    // webfox.getCriticsReview(criticsReview).then(({ data, error }) => {
    //   if (data && data.critics) {
    //     // setCriticsReview(data.critics);
    //   }
    //   setLoadingData(false);
    // });

    setLoading(false);
  }, [seoId[3], selectedView]);

  React.useEffect(() => {
    const shows = {
      shows: similarName,
    };

    const movies = {
      query: {
        seokey: seoKey,
        responseType: 'full',
        type: seoId[1] === 'movie' ? 'movie' : 'show',
      },
    };

    webfox.getSimilarMovies(movies).then(({ data, error }) => {
      if (error) {
        actionDispatch(actions.FETCH_SIMILAR_MOVIES_FAILURE, []);
      }
      actionDispatch(actions.FETCH_SIMILAR_MOVIES_SUCCESS, data || []);
      if (data && data.result) {
        const resultData = data.result.map((v) =>
          Object.assign(v, { img_url: v.posters && v.posters[0] })
        );
        setSimilar(resultData);
      }
    });
  }, [similarName]);

  const handleDropdown = (e) => {
    setSelectedView(e.target.value);
  };

  const getWTWlist = (list) => {
    if (list.length > 0) {
      return list
        .map((wtw) => {
          return wtw?.provider?.name ? wtw.provider.name : false;
        })
        .join(',');
    }
    return '';
  };

  const casts: any = [];
  staticShowProps &&
    staticShowProps[0] &&
    staticShowProps[0]?.casts?.map((item) => {
      casts.push(item);
    });
  staticShowProps &&
    staticShowProps[0] &&
    staticShowProps[0]?.crews?.map((item) => {
      casts.push(item);
    });
  const uniqueCasts = Array.from(
    new Set(casts.map((a) => a.character_name))
  ).map((character_name) => {
    return casts.find((a) => a.character_name === character_name);
  });

  const data =
    staticShowProps && staticShowProps[0] && staticShowProps[0]?.name;

  const cast: any = [];
  const crew: any = [];
  staticShowProps &&
    staticShowProps[0] &&
    staticShowProps[0]?.casts?.map((c) => {
      if (c.cast && c.cast.name) {
        cast.push(c.cast);
      }
    });
  staticShowProps &&
    staticShowProps[0] &&
    staticShowProps[0]?.crews?.map((c) => {
      if (c.crew && c.crew.name) {
        crew.push(c.crew);
      }
    });
  const getDirector = () => {
    const crews: any = [];
    if (staticShowProps && staticShowProps[0] && staticShowProps[0]?.crews) {
      staticShowProps[0].crews.map((c) => {
        if (
          c.role_name &&
          (c.role_name === 'Directing' ||
            c.role_name === 'Director' ||
            c.role_name === 'Writing' ||
            c.role_name === 'Writer')
        ) {
          if (c.crew && c.crew.name) {
            crews.push(c.crew);
          }
        }
      });
    }
    if (crews && crews.length > 0) {
      return crews[0];
    } else {
      return '';
    }
  };
  const getCreator = () => {
    const crews: any = [];
    if (staticShowProps[0] && staticShowProps[0]?.crews) {
      staticShowProps[0].crews.map((c) => {
        if (
          c.role_name &&
          (c.role_name === 'Creator' ||
            c.role_name === 'Producer' ||
            c.role_name === 'producer')
        ) {
          if (c.crew && c.crew.name) {
            crews.push(c.crew);
          }
        }
      });
    }
    if (crews && crews.length > 0) {
      return crews;
    } else {
      return '';
    }
  };
  const handleAllPhotos = (resObj, type, name, key, data) => {
    router.push({
      pathname: '/photos',
      query: { type, name, key, data, resObj },
    });
  };

  const handleEpisodesAll = (
    resObj,
    key,
    view,
    url,
    name,
    genres,
    providers,
    cert
  ) => {
    router.push({
      pathname: `/all-episodes/${url}`,
      query: { key, view, name, genres, providers, cert, resObj },
    });
  };

  const handleSeeAllTrailers = (type, name, key, data, url) => {
    router.push({
      pathname: `/trailer/${url}`,
      query: { type, name, key, data },
    });
  };

  //code check
  const handleReviewClick = (contentType, url, seoUrl) => {
    if (contentType === 'critics') {
      //code check
      router.push({
        pathname: `/review/${seoUrl}`,
        // pathname: `/${staticShowProps[0]['name']
        //   .toLowerCase()
        //   .replace(/ /g, '-')}/${type}/review-details`,
        // search: `?seoUrl=${seoUrl}`,
      });
    } else {
      window.open(url, '_blank');
    }
  };

  const handleSimilar = (data, type, name) => {
    if (type === 'movie') {
      firebaseAnalytics.logEvent('seeall', {
        screen_view:
          '/seeall/similar movies' +
          (data && data.name ? '/' + data.name : '') +
          (data && data.languages ? '/' + data.languages.toString() : '') +
          (data && data.genres ? '/' + data.genres.toString() : '') +
          (data && data._id ? '/' + data._id : '') +
          '/' +
          getUserType(_ht_clientid ? true : false) +
          '/' +
          getPreferredLanguages(languagesArr) +
          '/' +
          getPreferredProviders(providersArr) +
          '/' +
          _ht_clientid
            ? _ht_clientid
            : device_UUID,
      });
      windowAny.Moengage?.track_event('seeall', {
        screen_view: '/seeall/similar movies',
        name: data && data.name ? data.name : '',
        primary_language:
          data && data.languages ? data.languages.toString() : '',
        genre: data && data.genres ? data.genres.toString() : '',
        id: data && data._id ? data._id : '',
        userType: getUserType(_ht_clientid ? true : false),
        preferredLanguages: getPreferredLanguages(languagesArr),
        preferredProviders: getPreferredProviders(providersArr),
        user_unique_id: _ht_clientid ? _ht_clientid : device_UUID,
      });
    } else {
      firebaseAnalytics.logEvent('seeall', {
        screen_view:
          '/seeall/similar shows' +
          (data && data.name ? '/' + data.name : '') +
          (data && data.languages ? '/' + data.languages.toString() : '') +
          (data && data.genres ? '/' + data.genres.toString() : '') +
          (data && data._id ? '/' + data._id : '') +
          '/' +
          getUserType(_ht_clientid ? true : false) +
          '/' +
          getPreferredLanguages(languagesArr) +
          '/' +
          getPreferredProviders(providersArr) +
          '/' +
          _ht_clientid
            ? _ht_clientid
            : device_UUID,
      });
      windowAny.Moengage?.track_event('seeall', {
        screen_view: '/seeall/similar shows',
        name: data && data.name ? data.name : '',
        primary_language:
          data && data.languages ? data.languages.toString() : '',
        genre: data && data.genres ? data.genres.toString() : '',
        id: data && data._id ? data._id : '',
        userType: getUserType(_ht_clientid ? true : false),
        preferredLanguages: getPreferredLanguages(languagesArr),
        preferredProviders: getPreferredProviders(providersArr),
        user_unique_id: _ht_clientid ? _ht_clientid : device_UUID,
      });
    }
    router.push({
      //pathname: `/similar/${type}/${name}/${seoKey}`,
      pathname: `/similar/${type}/${seoKey}`,
      //query: { seoKey, seoId, name, type },
    });

    // Tried clean up urls for SEO but on refresh fails
    // const query = buildQuery({ seoKey, seoId, name, type });
    // router.push(`/similar/${type}/${name}/${query}`, `/similar/${type}`);
  };

  const buildQuery = (a) => {
    if (typeof a !== 'object') return '';
    return `?${Object.keys(a)
      .map((k) => `${k}=${a[k]}`)
      .join('&')}`;
  };

  const releaseYear = episodes.map((n) => new Date(n.air_date).getFullYear());

  const year = releaseYear.filter(function (value, index, array) {
    return array.indexOf(value) == index;
  });

  const type =
    staticShowProps && staticShowProps[0] && staticShowProps[0]?.content_type;
  const { height } = React.useContext(ViewportContext);

  const handleWhereToWatchClick = () => {
    const params = {
      event:
        props.type === 'movie' ? 'movie_watchnow_cta' : 'show_watchnow_cta',
      details: {
        page_name: window.location.pathname,
        preferred_providers: getPreferredProviders(providersNameArr),
        preferred_languages: getPreferredLanguages(languagesArr),
        // userType: getUserType(_ht_clientid ? true : false),
        // user_unique_id: _ht_clientid ? _ht_clientid : device_UUID,
        // content_type: props.type,
        // name: staticShowProps[0] && staticShowProps[0].name,
        // formatted_id:
        //   staticShowProps[0].primary_language &&
        //   staticShowProps[0].primary_language.name + '_' + staticShowProps[0]._id,
        content_type: props && props.type ? props.type : '',
        name:
          staticShowProps && staticShowProps[0] && staticShowProps[0]?.name
            ? staticShowProps[0].name
            : '',
        formatted_id:
          staticShowProps &&
          staticShowProps[0] &&
          staticShowProps[0]?.primary_language &&
          staticShowProps[0]?.primary_language !== undefined &&
          staticShowProps[0]?.primary_language.name &&
          staticShowProps[0]?._id
            ? staticShowProps[0].primary_language.name +
              '_' +
              staticShowProps[0]._id
            : '',
      },
      context: contextParamsForREAnalytics,
    };
    webfox.postREAnalytics(params).then(({ data, error }) => {});

    firebaseAnalytics.logEvent(
      props.type === 'movie' ? 'moviewatchnowcta' : 'showwatchnowcta',
      {
        eventCategory:
          props.type === 'movie' ? 'movie_watchnow_cta' : 'show_watchnow_cta',
        eventAction: window.location.pathname,
        eventLabel: staticShowProps[0]?.name,
        eventValue: staticShowProps[0]?.match_score,
        userType: getUserType(_ht_clientid ? true : false),
        user_unique_id: _ht_clientid ? _ht_clientid : device_UUID,
        preferredLanguages: getPreferredLanguages(languagesArr),
        preferredProviders: getPreferredProviders(providersArr),
      }
    );
    windowAny.Moengage?.track_event(
      props.type === 'movie' ? 'moviewatchnowcta' : 'showwatchnowcta',
      {
        eventCategory:
          props.type === 'movie' ? 'movie_watchnow_cta' : 'show_watchnow_cta',
        eventAction: window.location.pathname,
        eventLabel: staticShowProps[0]?.name,
        eventValue: staticShowProps[0]?.match_score,
        userType: getUserType(_ht_clientid ? true : false),
        user_unique_id: _ht_clientid ? _ht_clientid : device_UUID,
        preferredLanguages: getPreferredLanguages(languagesArr),
        preferredProviders: getPreferredProviders(providersArr),
      }
    );
  };

  const getImageUrl = (details) => {
    return details.posters && details.posters[0]
      ? getWebpUrl(details.posters[0])
      : details.tmdb_posters
      ? details.tmdb_posters[0]
      : null;
  };

  const getCastArr = () => {
    const castsArr: any = [];
    staticShowProps[0] &&
      staticShowProps[0]?.casts?.length &&
      staticShowProps[0]?.casts?.map((item) => {
        castsArr.push({
          '@type': 'Person',
          url: '/name/nm' + item.cast.ottplay_id + '/',
          name: item.cast.name,
        });
      });
    return castsArr;
  };

  const movieSchema = () => {
    let dirObj: any = {};
    if (getDirector() !== '') {
      dirObj = {
        '@type': 'Person',
        url: '/name/nm' + getDirector().ottplay_id + '/',
        name: getDirector().name,
      };
    }

    const creatorArr: any = [];
    getCreator().length > 0 &&
      getCreator().map((item) => {
        if (item && item.crew) {
          creatorArr.push({
            '@type': 'Person',
            url: '/name/nm' + item.crew.ottplay_id + '/',
            name: item.crew.name,
          });
        }
      });

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'http://schema.org',
            '@type': 'Movie',
            url:
              staticShowProps[0] && staticShowProps[0]?.seo_url
                ? staticShowProps[0].seo_url
                : 'https://www.ottplay.com',
            name:
              staticShowProps[0] && staticShowProps[0]?.name
                ? staticShowProps[0].name
                : 'Not available',
            image: staticShowProps[0]?.tmdb_posters
              ? staticShowProps[0].tmdb_posters[0]
              : staticShowProps[0]?.posters
              ? staticShowProps[0]?.posters[0]
              : 'www.ottplay.com',
            genre:
              staticShowProps[0] && staticShowProps[0]?.genres?.length > 0
                ? staticShowProps[0].genres.map((i) => i.name)
                : null,
            contentRating:
              staticShowProps[0] &&
              staticShowProps[0]?.certifications &&
              staticShowProps[0]?.certifications?.certification
                ? staticShowProps[0].certifications?.certification
                : 'Not available',
            actor: getCastArr().length > 0 ? [...getCastArr()] : [],
            director: { ...dirObj },
            creator: creatorArr.length > 0 ? [...creatorArr] : [],
            description: staticShowProps[0]?.seo?.meta_description
              ? removeAllHTMLTags(staticShowProps[0].seo.meta_description)
              : staticShowProps[0]?.full_synopsis
              ? removeAllHTMLTags(staticShowProps[0].full_synopsis)
              : 'Not available',
            datePublished:
              staticShowProps[0] && staticShowProps[0]?.onboarding_updated_on
                ? new Date(staticShowProps[0].onboarding_updated_on)
                    .toString()
                    .slice(4)
                : new Date().toString().slice(4),
            keywords:
              staticShowProps[0]?.seo &&
              staticShowProps[0]?.seo?.meta_keywords &&
              staticShowProps[0]?.seo?.meta_keywords?.length > 0
                ? staticShowProps[0].seo.meta_keywords.join(',')
                : null,
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingCount: 1,
              bestRating: 10.0,
              worstRating: 1.0,
              ratingValue:
                staticShowProps[0] && staticShowProps[0]?.ottplay_rating
                  ? staticShowProps[0].ottplay_rating
                  : 0.0,
            },
            duration:
              'PT' +
              Math.floor(staticShowProps[0]?.run_time / 60) +
              'H' +
              (staticShowProps[0]?.run_time % 60) +
              'M',
            trailer: {
              '@type': 'VideoObject',
              name: 'Official Trailer',
              embedUrl:
                staticShowProps[0] &&
                staticShowProps[0]?.videos_trailers[0] &&
                staticShowProps[0]?.videos_trailers[0]?.video_url
                  ? staticShowProps[0].videos_trailers[0].video_url
                  : 'www.ottplay.com',
              thumbnail: {
                '@type': 'ImageObject',
                contentUrl:
                  staticShowProps[0] &&
                  staticShowProps[0]?.videos_trailers[0] &&
                  staticShowProps[0]?.videos_trailers[0]?.video_url
                    ? staticShowProps[0].videos_trailers[0].video_url
                    : 'www.ottplay.com',
              },
              thumbnailUrl:
                staticShowProps[0] &&
                staticShowProps[0]?.videos_trailers[0] &&
                staticShowProps[0]?.videos_trailers[0]?.thumbnail_url
                  ? staticShowProps[0].videos_trailers[0].thumbnail_url
                  : 'www.ottplay.com',
              description:
                staticShowProps[0] &&
                staticShowProps[0]?.videos_trailers[0] &&
                staticShowProps[0]?.videos_trailers[0]?.title
                  ? staticShowProps[0].videos_trailers[0].title
                  : staticShowProps[0]?.seo &&
                    staticShowProps[0]?.seo?.meta_description
                  ? staticShowProps[0]?.seo?.meta_description
                  : staticShowProps[0] && staticShowProps[0]?.name
                  ? staticShowProps[0]?.name + ' trailer'
                  : 'OTTPlay',
              uploadDate:
                staticShowProps[0] && staticShowProps[0]?.onboarding_updated_on
                  ? new Date(staticShowProps[0].onboarding_updated_on)
                      .toString()
                      .slice(4)
                  : new Date().toString().slice(4),
            },
          }),
        }}
      />
    );
  };

  const showSchema = () => {
    const seasons = episodes.reduce((unique, o) => {
      if (!unique.some((obj) => obj.season_number === o.season_number)) {
        unique.push(o);
      }
      return unique;
    }, []);
    const schema_seasons: any = [];
    seasons.map((item) => {
      const e: any = [];
      episodes.map((item2) => {
        if (item2.season_number === item.season_number) {
          e.push(item2);
        }
      });
      const alt_e: any = [];
      e.map((i) => {
        alt_e.push({
          '@type': 'TVEpisode',
          episodeNumber: i.episode_number,
          name: 'Episode ' + i.episode_number,
        });
      });
      schema_seasons.push({
        '@type': 'TVSeason',
        datePublished: item.air_date,
        name: 'Season ' + item.season_number,
        numberOfEpisodes: e.length,
        episode: alt_e,
      });
    });
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'http://schema.org',
            '@type': 'tvseries',
            actor: getCastArr().length > 0 ? [...getCastArr()] : [],
            author: {
              '@type': 'Person',
              url: '/name/nm' + getDirector().ottplay_id + '/',
              name: getDirector().name,
            },
            name:
              staticShowProps[0] && staticShowProps[0]?.name
                ? staticShowProps[0]?.name
                : '',
            containsSeason: schema_seasons,
          }),
        }}
      />
    );
  };

  const siteNavigationSchema = () => {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'http://schema.org',
            '@type': 'ItemList',
            itemListElement: [
              {
                '@type': 'SiteNavigationElement',
                position: 1,
                name: 'Home',
                url: 'http://www.ottplay.com',
              },
              {
                '@type': 'SiteNavigationElement',
                position: 2,
                name: props.type === 'movie' ? 'Movies' : 'Shows',
                url: 'http://www.ottplay.com/shows/',
              },
              {
                '@type': 'SiteNavigationElement',
                position: 3,
                name:
                  staticShowProps[0] && staticShowProps[0]?.name
                    ? staticShowProps[0]?.name
                    : 'Not avilable',
                url:
                  'http://www.ottplay.com/shows/' +
                  (staticShowProps[0] && staticShowProps[0]?.seo_url
                    ? staticShowProps[0]?.seo_url
                    : ''),
              },
            ],
          }),
        }}
      />
    );
  };

  const breadcrumbSchema = () => {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'http://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                item: {
                  '@id': 'https://www.ottplay.com',
                  name: 'Home',
                },
              },
              {
                '@type': 'ListItem',
                position: 2,
                item: {
                  '@id':
                    'https://www.ottplay.com/' + props.type === 'movie'
                      ? 'movies'
                      : 'shows',
                  name: props.type === 'movie' ? 'Movies' : 'Shows',
                },
              },
              {
                '@type': 'ListItem',
                position: 3,
                item: {
                  '@id':
                    'https://www.ottplay.com/' + props.type === 'movie'
                      ? 'movies'
                      : 'shows' +
                        (staticShowProps[0] && staticShowProps[0]?.seo_url
                          ? staticShowProps[0]?.seo_url
                          : ''),
                  name:
                    staticShowProps[0] && staticShowProps[0]?.name
                      ? staticShowProps[0]?.name
                      : 'Not avilable',
                },
              },
            ],
          }),
        }}
      />
    );
  };

  if (staticShowProps)
    return (
      <React.Fragment>
        {staticShowProps && staticShowProps.length > 0 ? (
          <SEO
            exposeToGoogle={
              false
              // staticShowProps &&
              // staticShowProps[0] &&
              // staticShowProps[0]?.is_crawlable
            }
            title={`Show - ${router.asPath.split('/')[2]}`}
            ogData={{
              ogTitle: staticShowProps[0]?.name ? staticShowProps[0].name : '',
              ogDescription: staticShowProps[0]?.full_synopsis
                ? staticShowProps[0].full_synopsis
                : staticShowProps[0]?.seo?.meta_description
                ? staticShowProps[0].seo.meta_description
                : null,

              ogImage: getImageUrl(staticShowProps[0]),
            }}
            metaData={{
              metaTitle: staticShowProps[0]?.seo?.meta_title
                ? staticShowProps[0].seo.meta_title
                : `${staticShowProps[0]?.name ? staticShowProps[0].name : ''} ${
                    staticShowProps[0]?.release_year
                      ? staticShowProps[0].release_year
                      : ''
                  } watch movie streaming online on ${getWTWlist(
                    staticShowProps[0]?.where_to_watch
                      ? staticShowProps[0].where_to_watch
                      : []
                  )}`,
              metaDescription: staticShowProps[0]?.seo?.meta_description
                ? staticShowProps[0].seo.meta_description
                : staticShowProps[0]?.full_synopsis
                ? staticShowProps[0].full_synopsis
                : null,
              metaKeywords:
                staticShowProps[0]?.seo?.meta_keywords?.length > 0
                  ? staticShowProps[0].seo.meta_keywords.join(',')
                  : '',
            }}
            microData={{
              name: staticShowProps[0]?.name ? staticShowProps[0].name : '',
              description: staticShowProps[0]?.seo?.meta_description
                ? removeAllHTMLTags(staticShowProps[0].seo.meta_description)
                : staticShowProps[0]?.full_synopsis
                ? removeAllHTMLTags(staticShowProps[0].full_synopsis)
                : null,
              image: staticShowProps[0]?.tmdb_posters
                ? staticShowProps[0].tmdb_posters[0]
                : staticShowProps[0]?.posters
                ? staticShowProps[0].posters[0]
                : 'www.ottplay.com',
              url: `${
                process.env.REACT_APP_FRONTEND_URL + router?.asPath?.slice(1)
              }`,
              editor: 'OTTPlay',
              headline: staticShowProps[0]?.name ? staticShowProps[0].name : '',
              inLanguage: 'English',
              sourceOrganization: 'OTTplay',
              keywords:
                staticShowProps[0]?.seo?.meta_keywords?.length > 0
                  ? staticShowProps[0].seo.meta_keywords.join(',')
                  : '',
              datePublished:
                staticShowProps[0] && staticShowProps[0]?.onboarding_updated_on
                  ? new Date(staticShowProps[0]?.onboarding_updated_on)
                      .toString()
                      .slice(4)
                  : new Date().toString().slice(4),

              dateModified:
                staticShowProps[0] && staticShowProps[0]?.onboarding_updated_on
                  ? new Date(staticShowProps[0].onboarding_updated_on)
                      .toString()
                      .slice(4)
                  : new Date().toString().slice(4),
            }}
            schema={[
              siteNavigationSchema(),
              breadcrumbSchema(),
              staticShowProps[0] &&
              staticShowProps[0].content_type &&
              staticShowProps[0].content_type === 'movie'
                ? movieSchema()
                : showSchema(),
              WebPageSchema(
                staticShowProps[0] && staticShowProps[0]?.name
                  ? staticShowProps[0].name
                  : 'Show details',
                staticShowProps[0]?.seo?.meta_description
                  ? removeAllHTMLTags(staticShowProps[0].seo?.meta_description)
                  : staticShowProps[0]?.full_synopsis
                  ? removeAllHTMLTags(staticShowProps[0].full_synopsis)
                  : 'Description not available'
              ),
            ]}
          />
        ) : null}
        <div
          className={classes.root}
          style={{ minHeight: height > 900 ? '82vh' : '82vh' }}
        >
          <Grid xs={12}>
            <Grid xs={12} container item>
              <Grid sm={1} lg={2} item></Grid>
              <Grid xs={12} sm={10} lg={8} item className={classes.pathBox}>
                {/* <p className={classes.path}>
              {type != undefined ? `Discover » ${type} » ${data}` : ''}
            </p> */}
                {type != undefined ? (
                  // <PagePath
                  //   path={[
                  //     'Home',
                  //     `${type === 'movie' ? 'Movies' : 'Shows'}`,
                  //     `${data}`,
                  //   ]}
                  // />
                  <PagePath
                    path={[
                      { name: 'Home', path: '/home' },
                      {
                        name: `${type === 'movie' ? 'Movies' : 'Shows'}`,
                        path: `${type === 'movie' ? '/movies' : '/shows'}`,
                      },
                      {
                        name: `${data}`,
                        path: null,
                      },
                    ]}
                  />
                ) : // <p className={classes.path}>
                //   <a
                //     className="bread-crumb-link"
                //     onClick={() => history.push('/home')}
                //   >
                //     {'Home'}
                //   </a>{' '}
                //   <span>{'>>'}</span>{' '}
                //   <a
                //     className="bread-crumb-link"
                //     onClick={() => {
                //       type === 'show'
                //         ? history.push('/shows')
                //         : history.push('/movies');
                //     }}
                //   >
                //     {`${type === 'movie' ? 'Movies' : 'Shows'}`}{' '}
                //   </a>{' '}
                //   <span>{'>>'}</span> {`${data}`}
                // </p>
                null}
              </Grid>
              <Grid item sm={1} lg={2}></Grid>
            </Grid>

            {loadingData ? (
              <Spinner styles={{ height: '70vh' }} />
            ) : (
              <>
                {staticShowProps &&
                  staticShowProps.map((details) => {
                    const array =
                      JSON.parse(
                        typeof window !== 'undefined' &&
                          localStorage.getItem(
                            LOCALSTORAGE_KEY_CONSTANTS.WATCHLISTED_DATA_OBJ
                          )
                      ) || [];

                    let isSelected;
                    if (array != null) {
                      isSelected = array.findIndex((item) => {
                        const value = details._id
                          ? item._id === details._id
                          : item.id === details.id;
                        return value;
                      });
                    }
                    const likedArray: any = getLocalStorageData(
                      JSON.parse(
                        typeof window !== 'undefined' &&
                          localStorage.getItem(
                            LOCALSTORAGE_KEY_CONSTANTS.LIKED_DATA_OBJ
                          )
                      ) || [],
                      webstore.likeArr.liked
                    );
                    let isLiked;
                    if (likedArray != null) {
                      isLiked = likedArray.findIndex((item) => {
                        const value = details._id
                          ? item._id === details._id
                          : item.id === details.id;
                        return value;
                      });
                    }
                    const hiddenArray: any = getLocalStorageData(
                      JSON.parse(
                        typeof window !== 'undefined' &&
                          localStorage.getItem(
                            LOCALSTORAGE_KEY_CONSTANTS.HIDDEN_DATA_OBJ
                          )
                      ) || [],
                      webstore.hideMovie.hidden
                    );
                    let isHidden;
                    if (hiddenArray != null) {
                      // isHidden = hiddenArray.findIndex((item) =>
                      //   movie._id ? item._id === movie._id : item.id === movie.id
                      // );
                      isHidden = hiddenArray.findIndex((item) => {
                        const value = details._id
                          ? item._id === details._id
                          : item.id === details.id;
                        return value;
                      });
                    }
                    // const dislikeArray: any = webstore.dislikedMovie.dislike;
                    const dislikeArray: any = getLocalStorageData(
                      JSON.parse(
                        typeof window !== 'undefined' &&
                          localStorage.getItem(
                            LOCALSTORAGE_KEY_CONSTANTS.UNLIKED_DATA_OBJ
                          )
                      ) || [],
                      webstore.dislikedMovie.dislike
                    );
                    let isDisliked;
                    if (dislikeArray != null) {
                      // isDisliked = dislikeArray.findIndex((item) =>
                      //   movie._id ? item._id === movie._id : item.id === movie.id
                      // );
                      isDisliked = dislikeArray.findIndex((item) => {
                        const value = details._id
                          ? item._id === details._id
                          : item.id === details.id;
                        return value;
                      });
                    }

                    const seasons = episodes.reduce((unique, o) => {
                      if (
                        !unique.some(
                          (obj) => obj.season_number === o.season_number
                        )
                      ) {
                        unique.push(o);
                      }
                      return unique;
                    }, []);

                    return (
                      <>
                        <MovieDescription
                          name={details?.name}
                          trailer_url={
                            details?.videos_trailers?.length > 0
                              ? details.videos_trailers[0] &&
                                details.videos_trailers[0].video_url
                              : null
                          }
                          // backdrop={
                          //   details.s3_backdrop.length > 0
                          //     ? details.s3_backdrop[0]
                          //     : null
                          // }
                          sourcePage={
                            details.content_type === 'show'
                              ? 'ShowDetail'
                              : 'MovieDetail'
                          }
                          // backdrop={
                          //   (details.tmdb_posters && details.tmdb_posters[0]) ||
                          //   (details.posters && details.posters[0])
                          // }
                          backdrop={getImageUrl(details)}
                          rating={details.ottplay_rating}
                          criticScore={details.critics_score}
                          match={details.match_score}
                          release_year={details.release_year}
                          runtime={details.run_time}
                          faq={details.faq}
                          providers={
                            details &&
                            details.where_to_watch &&
                            sortProvidersByUserPreference(
                              details.where_to_watch || details.providers,
                              providersNameArr
                            ).length > 0 &&
                            sortProvidersByUserPreference(
                              details.where_to_watch || details.providers,
                              providersNameArr
                            ).map((pro) => pro)
                          }
                          genres={
                            details.genres &&
                            details.genres.slice(0, 2).map((n) => n.name)
                          }
                          seo={details.seo_url}
                          certification={details.certifications}
                          details={details}
                          isSelected={isSelected !== -1}
                          isLiked={isLiked !== -1}
                          isDisliked={isDisliked !== -1}
                          content_type={
                            details.content_type.charAt(0).toUpperCase() +
                            details.content_type.slice(1)
                          }
                          // providers={details.providers.map(
                          //   (provider) => provider.name
                          // )}
                          description={
                            details.is_original_synopsis &&
                            details.full_synopsis
                              ? encodeURIComponent(details.full_synopsis)
                              : null
                          }
                          crew_details={crew.slice(0, 3).join(', ') || null}
                          director_details={getDirector()}
                          cast_details={cast.slice(0, 3) || null}
                          synopTitle={details.name}
                          synopDescription={
                            details.is_original_synopsis &&
                            details.full_synopsis &&
                            encodeURIComponent(details.full_synopsis)
                          }
                          // googleAd={
                          //   <GoogleAdOttPlay adInfo={AD_CODES.mobile['3']} />
                          // }
                        />
                        <Grid xs={12} container item>
                          <Grid sm={1} lg={2} item></Grid>
                          <Grid
                            xs={12}
                            sm={10}
                            lg={8}
                            item
                            className={classes.detailsLowerBox}
                          >
                            {(details?.where_to_watch &&
                              details?.where_to_watch?.length > 0) ||
                            (details?.providers &&
                              details?.providers?.length > 0) ? (
                              <WhereToWatch
                                handleWhereToWatchClick={
                                  handleWhereToWatchClick
                                }
                                whereToWatch={sortProvidersByUserPreference(
                                  details.where_to_watch || details.providers,
                                  providersNameArr
                                )}
                                title={'Where to watch ' + details.name + ' ?'}
                                googleAd={
                                  <GoogleAdOttPlay adInfo={AD_CODES.item9} />
                                }
                              />
                            ) : null}
                            {episodes?.length > 0 ? (
                              <Episodes
                                episodes={
                                  filteredEpisodes &&
                                  filteredEpisodes.sort(
                                    (a, b) =>
                                      a.episode_number - b.episode_number
                                  )
                                }
                                seasons={seasons}
                                handleDropdown={handleDropdown}
                                onClick={() =>
                                  handleEpisodesAll(
                                    details,
                                    seoKey[3],
                                    selectedView,
                                    details.seo_url,
                                    details.name,
                                    details && details.genres,
                                    details && details.where_to_watch,
                                    details && details.certifications
                                  )
                                }
                              />
                            ) : null}
                            {casts?.length > 0 ? (
                              <CastAndCrew
                                crewDetail={casts}
                                title={details.name + ' Cast and Crew'}
                                sourcePage={
                                  details.content_type === 'show'
                                    ? 'ShowDetail'
                                    : 'MovieDetail'
                                }
                              />
                            ) : null}
                            <Hidden only={['xs']}>
                              <Grid
                                item
                                xs={12}
                                container
                                className={classes.advert}
                              >
                                <GoogleAdOttPlay adInfo={AD_CODES.item10} />
                                {/* <Grid item xs={8}>
                              <ImageComponent src={ads} alt="" style={{ width: '100%' }} />
                            </Grid> */}
                              </Grid>
                            </Hidden>
                            {similar.length > 0 ? (
                              <SimilarMovie
                                screen={'home'}
                                data={
                                  details.content_type === 'show'
                                    ? 'Shows similar to ' + details.name
                                    : 'Movies similar to ' + details.name
                                }
                                results={similar.slice(0, 10)}
                                handleSimilar={() =>
                                  handleSimilar(
                                    details,
                                    details.content_type,
                                    details.name
                                  )
                                }
                                tag={'similar'}
                                sourcePage={
                                  details.content_type === 'show'
                                    ? 'ShowDetail'
                                    : 'MovieDetail'
                                }
                              />
                            ) : null}
                            {/* ad codes
                        <Hidden only={['xs']}>
                          <Grid
                            xs={12}
                            container
                            direction="row"
                            justify="center"
                            alignItems="center"
                          >
                            <Grid item md={2}></Grid>
                            <Grid
                              item
                              xs={12}
                              md={10}
                              container
                              className={classes.advert}
                            >
                              <ImageComponent src={ads} alt="" style={{ width: '100%' }} />
                            </Grid>

                            <Grid item xs={4}></Grid>
                          </Grid>
                        </Hidden> */}

                            {details?.videos_trailers?.length > 1 ? (
                              <TrailerById
                                trailers={details.videos_trailers.slice(0, 6)}
                                seeAllTrailers={() =>
                                  handleSeeAllTrailers(
                                    details.content_type,
                                    details.name,
                                    details.id,
                                    details.videos_trailers,
                                    details.seo_url
                                  )
                                }
                              />
                            ) : null}

                            {/* {details.photos && details.photos.length > 0 ? (
                          <PhotoThumbnail
                            photos={details.photos}
                            allPhotos={() =>
                              handleAllPhotos(
                                details,
                                details.content_type,
                                details.name,
                                details.id,
                                details.photos
                              )
                            }
                          />
                        ) : null} */}

                            {/* Hidden */}
                            {/* {staticShowProps[0]['reviews'] &&
                        staticShowProps[0]['reviews'].length > 0 ? (
                          <Grid item xs={12} className={classes.reviewBox}>
                            <div className={classes.text}>
                              Reviews and Ratings
                            </div>
                          </Grid>
                        ) : null} */}

                            {/* <Hidden only={['xs']}> */}
                            {staticShowProps[0]['reviews'] &&
                            staticShowProps[0]['reviews'].filter(
                              (review) =>
                                review.headline !== '' && review.critic_review
                            ).length > 0 ? (
                              <>
                                <Grid
                                  item
                                  xs={12}
                                  className={classes.reviewBox}
                                >
                                  <div className={classes.text}>
                                    Reviews and Ratings
                                  </div>
                                </Grid>
                                <CriticsReview
                                  criticsReviews={staticShowProps[0][
                                    'reviews'
                                  ].filter(
                                    (review) =>
                                      review.headline !== '' &&
                                      review.critic_review
                                  )}
                                  handleClick={handleReviewClick}
                                />
                              </>
                            ) : null}
                            {/* <UserReview location={data} /> */}
                            {/* </Hidden> */}
                            {/* <Hidden only={['sm', 'md', 'lg', 'xl']}>
                          {staticShowProps[0]['reviews'] &&
                          staticShowProps[0]['reviews'].length > 0 ? (
                            <CriticsUsersReviewMobile />
                          ) : null}
                        </Hidden> */}

                            {/* <TopNews /> */}
                          </Grid>
                          <Grid sm={1} lg={2} item></Grid>
                        </Grid>
                      </>
                    );
                  })}
              </>
            )}
          </Grid>
        </div>
      </React.Fragment>
    );
  else return false;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    minHeight: '70vh',
  },
  advert: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
  },
  pathBox: {
    padding: '0px 0px 10px 10px',
  },
  path: {
    color: '#ffffff',
    opacity: 0.6,
    fontSize: 'clamp(10px, 0.9vw, 14px)',
    margin: '8px 0px 8px 10px',
    textTransform: 'capitalize',
    '& span': {
      fontSize: 10,
      letterSpacing: -1,
      margin: '0px 4px',
    },
  },
  reviewBox: {
    paddingLeft: 10,
  },
  text: {
    margin: '40px 0 25px 0',
    fontSize: 'clamp(16px, 1.6vw, 24px)',
    color: '#ffffff',
    fontWeight: 500,
  },
  [theme.breakpoints.down('xs')]: {
    pathBox: {
      padding: '0px 0px 10px 2px',
    },
    path: {
      fontSize: 10,
      textTransform: 'uppercase',
      marginLeft: 16,
      marginTop: 16,
      '& span': {
        fontSize: 8,
      },
    },
    detailsLowerBox: {
      paddingLeft: 16,
      paddingRight: 16,
    },
    text: {
      margin: 0,
    },
    reviewBox: {
      paddingLeft: 0,
    },
  },
}));

export async function getStaticProps(context) {
  let typeData;
  if (context && context.params && context.params.showslug[2] === 'preview') {
    typeData = 'preview';
  }
  const pagePath = `${context.params.showslug[0]}/${context.params.showslug[1]}`;
  const params = {
    seoUrl: pagePath,
    [typeData]: typeData ? true : null,
  };
  const res = await webfox.getShowDetailsList(params);

  if (await !res.data) {
    return {
      notFound: true,
    };
  }
  
  return {
    props: {
      staticShowProps: await res.data.shows,
    },
  };
}
export async function getStaticPaths(props) {
  let allShowsList = [];
  let typeData = '';
  if (props.location && props.location.state && props.location.state.forPage) {
    typeData = props.location.state.forPage.slice(0, -1);
  } else {
    typeData = 'language';
  }
  const params = {
    limit: 18,
    page: 1,
    [typeData]:
      props.location && props.location.state && props.location.state.data.name
        ? props.location.state.data.name
        : props.languages
        ? props.languages.name
        : 'English',
  };

  let data = [];
  const getMovies = await webfox.getAllShows(params);
  await getMovies.response?.data.shows.map((item) => {
    data.push([{ params: { showslug: item.seo_url } }]);
  });
  return {
    paths: data,
    fallback: 'blocking',
  };
}
