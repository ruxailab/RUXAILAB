# -*- coding: utf-8 -*-
# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from google.events.cloud.functions_v2 import gapic_version as package_version

__version__ = package_version.__version__



from .types.data import BuildConfig
from .types.data import EventFilter
from .types.data import EventTrigger
from .types.data import Function
from .types.data import FunctionEventData
from .types.data import RepoSource
from .types.data import SecretEnvVar
from .types.data import SecretVolume
from .types.data import ServiceConfig
from .types.data import Source
from .types.data import SourceProvenance
from .types.data import StateMessage
from .types.data import StorageSource
from .types.data import Environment

__all__ = (
'BuildConfig',
'Environment',
'EventFilter',
'EventTrigger',
'Function',
'FunctionEventData',
'RepoSource',
'SecretEnvVar',
'SecretVolume',
'ServiceConfig',
'Source',
'SourceProvenance',
'StateMessage',
'StorageSource',
)
