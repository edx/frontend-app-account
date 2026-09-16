import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { convertKeyNames, snakeCaseObject } from '@edx/frontend-platform/utils';

/**
 * Fetch the site languages a user may select, as released via DarkLangConfig on the LMS.
 *
 * Each entry is `{ code, name, released }`, where `released` is false for beta languages.
 * This replaces the hardcoded list this MFE used to ship, so adding or removing a site
 * language no longer needs a frontend release.
 */
export async function getSiteLanguageList() {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/lang_pref/v1/released_languages`);
  return data;
}

export async function patchPreferences(username, params) {
  let processedParams = snakeCaseObject(params);
  processedParams = convertKeyNames(processedParams, {
    pref_lang: 'pref-lang',
  });

  await getAuthenticatedHttpClient()
    .patch(`${getConfig().LMS_BASE_URL}/api/user/v1/preferences/${username}`, processedParams, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    });

  return params; // TODO: Once the server returns the updated preferences object, return that.
}

export async function postSetLang(code) {
  const formData = new FormData();
  const requestConfig = {
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  };
  const url = `${getConfig().LMS_BASE_URL}/i18n/setlang/`;
  formData.append('language', code);

  await getAuthenticatedHttpClient()
    .post(url, formData, requestConfig);
}
