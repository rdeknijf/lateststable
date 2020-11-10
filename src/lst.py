import logging
import re
import sys
from distutils.version import LooseVersion
from typing import Any, List, Optional

import requests
from packaging.version import parse, Version
from pydantic.main import BaseModel

loglevel = logging.INFO

logger = logging.getLogger(__name__)
logger.setLevel(loglevel)

handler = logging.StreamHandler(sys.stdout)
handler.setLevel(loglevel)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


class Result(BaseModel):
    name: str
    version: Optional[str]
    platform_version_string: str
    major: Optional[str]
    minor: Optional[str]
    patch: Optional[str]

    class Config:
        schema_extra = {
            "example": {
                "name": "somepackage",
                "version": "3.2.1",
                "platform_version_string": "3.2.1",
                "major": "32",
                "minor": "2",
                "patch": "1",
            }
        }


class LatestStable:
    re_version = re.compile(r"^v?(\d+\.)?(\d+\.)?(\*|\d+)$")
    re_version_free = re.compile(r"(v?(?:\d+\.)(?:\d+\.)(?:\*|\d+)[.\w]*)")
    re_latest_release_version = re.compile(r"latest_release_version = (v?(\d+\.)?(\d+\.)?(\*|\d+))")
    re_extract_version_string = re.compile(r"(?:(\d+\.[.\d]*\d+))")

    def sort_and_normalize_versions(self, releases: List[str]):

        out = []
        for release in releases:

            if self.re_version.match(release):
                out.append(release)

        return sorted(out, key=LooseVersion)

    def pypi(self, package: Any) -> Optional[Result]:
        url = f"https://pypi.python.org/pypi/{package}/json"

        r = requests.get(url)

        if r.ok:
            releases = list(r.json()['releases'])

            sorted_releases = self.sort_and_normalize_versions(releases)

            logger.debug(f'releases found for {package}: {sorted_releases}')

            return self._prep_output(package, sorted_releases[-1])

        logger.debug(f'Something went wrong retrieving {package} from pypi: Code {r.status_code}')

        return None

    def github(self, package: str) -> Optional[Result]:

        # check /latest

        url = f"https://api.github.com/repos/{package}/releases/latest"
        logger.debug(f"Checking: {url}")

        r = requests.get(url)

        if r.ok:
            return self._prep_output(package, r.json().get('tag_name'))

        # check /releases

        url = f"https://api.github.com/repos/{package}/releases"
        logger.debug(f"Could not get from /latest, so checking: {url}")

        r = requests.get(url)

        if r.ok:
            releases = [i.get('tag_name') for i in r.json()]

            sorted_releases = self.sort_and_normalize_versions(releases)

            logger.debug(f'releases found for {package}: {sorted_releases}')

            if len(sorted_releases):
                return self._prep_output(package, sorted_releases[-1])

        # check /tags

        url = f"https://api.github.com/repos/{package}/tags"
        logger.debug(f"Could not get from /releases, so checking: {url}")

        r = requests.get(url)

        if r.ok:
            tags = [i.get('name') for i in r.json()]
            sorted_tags = self.sort_and_normalize_versions(tags)

            logger.debug(f'releases found for {package}: {sorted_tags}')

            if len(sorted_tags):
                return self._prep_output(package, sorted_tags[-1])

        logger.debug(f'Something went wrong retrieving {package} from github: Code {r.status_code}')

        return None

    def docker(self, package: str) -> Optional[Result]:

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

            return self._prep_output(package, sorted_releases[-1])

        logger.debug(f'Something went wrong retrieving {package} from docker hub: Code {r.status_code}')
        return None

    def wikipedia(self, package: str) -> Optional[Result]:

        def fetch(url):

            r = requests.get(url)

            if r.ok:
                try:

                    text = r.json()['query']['pages'][list(r.json()['query']['pages'])[0]]['revisions'][0]['slots'][
                        'main'].get('*')
                except KeyError:
                    return None

                reg = self.re_version_free.search(text)

                if reg:
                    version = reg.group(1)

                    if version:
                        return version

                return None

        baseurl = 'http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json' \
                  '&rvslots=main&rvsection=0'

        version = fetch(f'{baseurl}&titles=Template:Latest_stable_software_release/{package}')

        if not version:
            version = fetch(f'{baseurl}&titles={package}')

        return self._prep_output(package, version)

    def jetbrains(self, package: str) -> Optional[Result]:

        # this would be a list of all releases
        # url = 'https://data.services.jetbrains.com/products/releases?code=IIU&type=release'

        product_map = {
            'resharper': 'RS',
            'appcode': 'AC',
            'phpstorm': 'PS',
            'datagrip': 'DG',
            'idea': 'IIC',
            'intellij': 'IIC',
            'intellij-idea': 'IIC',
            'idea-community': 'IIC',
            'ideaIU': 'IIU',
            'idea-ultimate': 'IIU',
            'intellij-ultimate': 'IIU',
            'intellij-idea-ultimate': 'IIU',
            'intellij-idea-edu': 'IIE',
            'idea-edu': 'IIE',
            'intellij-edu': 'IIE',
            'goland': 'GO',
            'youtrack': 'YTD',
            'clion': 'CL',
            'dotmemory': 'DM',
            'dotpeek': 'DP',
            'teamcity': 'TC',
            'resharperultimate': 'RC',
            'mps': 'MPS',
            'toolbox app': 'TBA',
            'rider': 'RD',
            'pycharm-edu': 'PCE',
            'pycharm': 'PCC',
            'pycharm-community': 'PCC',
            'hub': 'HB',
            'rubymine': 'RM',
            'pycharm-professional': 'PCP',
            'webstorm': 'WS',
            'dpk': 'DPK',
            'upsource': 'US',
            'dotcover': 'DC',
        }

        # map the input to the product code, if none extists, just use the code itself
        code = product_map[package] if package in product_map else package

        code_str = '%2C'.join(set(product_map.values()))

        url = f'https://data.services.jetbrains.com/products/releases?code={code_str}&latest=true&type=release'

        r = requests.get(url)

        if r.ok:
            version = r.json()[code][0]['version']

            return self._prep_output(package, version)

        return None

    def npm(self, package: str) -> Optional[Result]:

        url = f'http://registry.npmjs.org/{package}'

        r = requests.get(url)

        if r.ok:
            return self._prep_output(package, r.json()['dist-tags']['latest'])

        return None

    def _prep_output(self, name: str, version_string: Optional[str]) -> Optional[Result]:

        if not version_string:
            return None

        version = parse(version_string)

        if not isinstance(version, Version):
            reg = self.re_extract_version_string.search(version_string)

            version = parse(reg.group(1))

        if not isinstance(version, Version):
            return None

        return Result(name=name,
                      version=str(version),
                      platform_version_string=version_string,
                      major=str(version.major),
                      minor=str(version.minor),
                      patch=str(version.micro))


lst = LatestStable()
