import re
import sys
from typing import List, Optional
from distutils.version import LooseVersion
import logging

import requests

loglevel = logging.INFO

logger = logging.getLogger(__name__)
logger.setLevel(loglevel)

handler = logging.StreamHandler(sys.stdout)
handler.setLevel(loglevel)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


class LatestStable:

    re_version = re.compile(r"^v?(\d+\.)?(\d+\.)?(\*|\d+)$")
    re_latest_release_version = re.compile(r"latest release version = (v?(\d+\.)?(\d+\.)?(\*|\d+))")

    def sort_and_normalize_versions(self, releases: List[str]):

        out = []
        for release in releases:

            if self.re_version.match(release):
                out.append(release)

        return sorted(out, key=LooseVersion)

    def pypi(self, package: str, clean=True) -> Optional[str]:
        url = f"https://pypi.python.org/pypi/{package}/json"

        r = requests.get(url)

        if r.ok:
            releases = list(r.json()['releases'])

            sorted_releases = self.sort_and_normalize_versions(releases)

            logger.debug(f'releases found for {package}: {sorted_releases}')

            return self._normalize_version_string(sorted_releases[-1], clean)

        logger.debug(f'Something went wrong retrieving {package} from docker hub: '
                     f'Code {r.status_code}')

        return None

    def github(self, package: str, clean=True) -> Optional[str]:

        # check /latest

        url = f"https://api.github.com/repos/{package}/releases/latest"
        logger.debug(f"Checking: {url}")

        r = requests.get(url)

        if r.ok:
            return self._normalize_version_string(r.json().get('tag_name'), clean)

        # check /releases

        url = f"https://api.github.com/repos/{package}/releases"
        logger.debug(f"Could not get from /latest, so checking: {url}")

        r = requests.get(url)

        if r.ok:
            releases = [i.get('tag_name') for i in r.json()]

            sorted_releases = self.sort_and_normalize_versions(releases)

            logger.debug(f'releases found for {package}: {sorted_releases}')

            if len(sorted_releases):
                return self._normalize_version_string(sorted_releases[-1], clean)

        # check /tags

        url = f"https://api.github.com/repos/{package}/tags"
        logger.debug(f"Could not get from /releases, so checking: {url}")

        r = requests.get(url)

        if r.ok:
            tags = [i.get('name') for i in r.json()]
            sorted_tags = self.sort_and_normalize_versions(tags)

            logger.debug(f'releases found for {package}: {sorted_tags}')

            if len(sorted_tags):
                return self._normalize_version_string(sorted_tags[-1], clean)

        logger.debug(f'Something went wrong retrieving {package} from github: Code {r.status_code}')

        return None

    def docker(self, package: str, clean: bool = True) -> Optional[str]:

        url = f'https://registry.hub.docker.com/v1/repositories/{package}/tags'

        r = requests.get(url)

        if r.ok:

            releases = []
            for release in r.json():

                regex = re.compile(r"^(\d+\.)?(\d+\.)?(\*|\d+)$")

                if regex.match(release["name"]):
                    releases.append(release["name"])

            sorted_releases = self.sort_and_normalize_versions(releases)

            logger.debug(f'releases found for {package}: {sorted_releases}')

            return self._normalize_version_string(sorted_releases[-1], clean)

        logger.debug(f'Something went wrong retrieving {package} from docker hub: '
                     f'Code {r.status_code}')
        return None

    def wikipedia(self, package: str, clean: bool = True) -> Optional[str]:

        # try version template

        url = f'http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&' \
              f'format=json&titles=Template:Latest_stable_software_release/{package}&' \
              f'rvslots=main&rvsection=0'

        r = requests.get(url)

        if r.ok:

            text = r.json()['query']['pages'][list(r.json()['query']['pages'])[0]]['revisions'][0][
                'slots']['main'].get('*')

            reg = self.re_latest_release_version.search(text)

            if reg:
                return self._normalize_version_string(reg.group(1), clean)

        # try normal

        url = f'http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&' \
              f'format=json&titles={package}&rvslots=main&rvsection=0'

        r = requests.get(url)

        if r.ok:

            text = r.json()['query']['pages'][list(r.json()['query']['pages'])[0]]['revisions'][0][
                'slots']['main'].get('*')

            reg = self.re_latest_release_version.search(text)

            if reg:
                return self._normalize_version_string(reg.group(1), clean)

        # try with "_software"

        # url = f'http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&
        # format=json&titles={package}_(software)&rvsection=0'

        return None

    @staticmethod
    def _normalize_version_string(version_string: Optional[str], clean: bool) -> Optional[str]:

        if version_string is not None and clean:
            return version_string.lstrip('v')

        return version_string

    def anywhere(self, package, clean=True):

        ret = {
            'pypi': self.pypi(package, clean=clean),
            'github': self.pypi(package, clean=clean),
            'docker': self.docker(package, clean=clean)
        }

        return ret
