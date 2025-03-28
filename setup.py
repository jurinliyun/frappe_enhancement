from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in frappe_enhancement/__init__.py
from frappe_enhancement import __version__ as version

setup(
	name="frappe_enhancement",
	version=version,
	description="Frappe various script enhancement",
	author="jurin",
	author_email="jurin@ums.edu.my",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
