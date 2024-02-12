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
from google.events.cloud.dataplex import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.dataplex_v1.types.data import Asset
from google.events.cloud.dataplex_v1.types.data import AssetEventData
from google.events.cloud.dataplex_v1.types.data import AssetStatus
from google.events.cloud.dataplex_v1.types.data import DataAccessSpec
from google.events.cloud.dataplex_v1.types.data import DataAttribute
from google.events.cloud.dataplex_v1.types.data import DataAttributeBinding
from google.events.cloud.dataplex_v1.types.data import DataAttributeBindingEventData
from google.events.cloud.dataplex_v1.types.data import DataAttributeEventData
from google.events.cloud.dataplex_v1.types.data import DataProfileResult
from google.events.cloud.dataplex_v1.types.data import DataProfileSpec
from google.events.cloud.dataplex_v1.types.data import DataQualityDimensionResult
from google.events.cloud.dataplex_v1.types.data import DataQualityResult
from google.events.cloud.dataplex_v1.types.data import DataQualityRule
from google.events.cloud.dataplex_v1.types.data import DataQualityRuleResult
from google.events.cloud.dataplex_v1.types.data import DataQualitySpec
from google.events.cloud.dataplex_v1.types.data import DataScan
from google.events.cloud.dataplex_v1.types.data import DataScanEventData
from google.events.cloud.dataplex_v1.types.data import DataSource
from google.events.cloud.dataplex_v1.types.data import DataTaxonomy
from google.events.cloud.dataplex_v1.types.data import DataTaxonomyEventData
from google.events.cloud.dataplex_v1.types.data import Environment
from google.events.cloud.dataplex_v1.types.data import EnvironmentEventData
from google.events.cloud.dataplex_v1.types.data import Job
from google.events.cloud.dataplex_v1.types.data import Lake
from google.events.cloud.dataplex_v1.types.data import LakeEventData
from google.events.cloud.dataplex_v1.types.data import ResourceAccessSpec
from google.events.cloud.dataplex_v1.types.data import ScannedData
from google.events.cloud.dataplex_v1.types.data import Task
from google.events.cloud.dataplex_v1.types.data import TaskEventData
from google.events.cloud.dataplex_v1.types.data import Trigger
from google.events.cloud.dataplex_v1.types.data import Zone
from google.events.cloud.dataplex_v1.types.data import ZoneEventData
from google.events.cloud.dataplex_v1.types.data import DataScanType
from google.events.cloud.dataplex_v1.types.data import State

__all__ = ('Asset',
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
    'Task',
    'TaskEventData',
    'Trigger',
    'Zone',
    'ZoneEventData',
    'DataScanType',
    'State',
)
