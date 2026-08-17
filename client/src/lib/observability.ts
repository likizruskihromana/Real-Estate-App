import * as Sentry from '@sentry/react';
import posthog from 'posthog-js';

const sentryDsn=import.meta.env.VITE_SENTRY_DSN as string|undefined;
const posthogKey=import.meta.env.VITE_POSTHOG_KEY as string|undefined;
const posthogHost=(import.meta.env.VITE_POSTHOG_HOST as string|undefined)||'https://eu.i.posthog.com';

if(sentryDsn)Sentry.init({dsn:sentryDsn,environment:import.meta.env.MODE,release:import.meta.env.VITE_APP_RELEASE,tracesSampleRate:.1,sendDefaultPii:false,beforeSend(event){if(event.request){delete event.request.cookies;delete event.request.data}return event}});

export function enableProductAnalytics(){if(!posthogKey||posthog.__loaded)return;posthog.init(posthogKey,{api_host:posthogHost,person_profiles:'identified_only',disable_session_recording:true,autocapture:false,persistence:'localStorage+cookie',respect_dnt:true})}
export function disableProductAnalytics(){if(posthog.__loaded)posthog.opt_out_capturing()}
export function track(name:string,properties:Record<string,string|number|boolean|undefined>={}){if(posthog.__loaded&&!posthog.has_opted_out_capturing())posthog.capture(name,properties)}
export function reportClientError(error:unknown,context?:Record<string,string|number>){Sentry.withScope(scope=>{if(context)scope.setContext('domus',context);Sentry.captureException(error)})}
