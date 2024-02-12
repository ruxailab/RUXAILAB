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
from google.events.cloud.dataplex_v1 import gapic_version as package_version

__version__ = package_version.__version__



from .types.data import Asset
from .types.data import AssetEventData
from .types.data import AssetStatus
from .types.data import DataAccessSpec
from .types.data import DataAttribute
from .types.data import DataAttributeBinding
from .types.data import DataAttributeBindingEventData
from .types.data import DataAttributeEventData
from .types.data import DataProfileResult
from .types.data import DataProfileSpec
from .types.data import DataQualityDimensionResult
from .types.data import DataQualityResult
from .types.data import DataQualityRule
from .types.data import DataQualityRuleResult
from .types.data import DataQualitySpec
from .types.data import DataScan
from .types.data import DataScanEventData
from .types.data import DataSource
from .types.data import DataTaxonomy
from .types.data import DataTaxonomyEventData
from .types.data import Environment
from .types.data import EnvironmentEventData
from .types.data import Job
from .types.data import Lake
from .types.data import LakeEventData
from .types.data import ResourceAccessSpec
from .types.data import ScannedData
from .types.data import Task
from .types.data import TaskEventData
from .types.data import Trigger
from .types.data import Zone
from .types.data import ZoneEventData
from .types.data import DataScanType
from .types.data import State

__all__ = (
'Asset',
'AssetEventData',
'AssetStatus',
'DataAccessSpec',
'DataAttribute',
'DataAttributeBinding',
'DataAttributeBindingEventData',
'DataAttributeEventData',
'DataProfileResult',
'DataProfileSpec',
'DataQualityDimensionResult',
'DataQualityResult',
'DataQualityRule',
'DataQualityRuleResult',
'DataQualitySpec',
'DataScan',
'DataScanEventData',
'DataScanType',
'DataSource',
'DataTaxonomy',
'DataTaxonomyEventData',
'Environment',
'EnvironmentEventData',
'Job',
'Lake',
'LakeEventData',
'ResourceAccessSpec',
'ScannedData',
'State',
'Task',
'TaskEventData',
'Trigger',
'Zone',
'ZoneEventData',
)
