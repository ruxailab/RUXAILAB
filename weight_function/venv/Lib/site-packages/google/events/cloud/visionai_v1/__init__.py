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
from google.events.cloud.visionai_v1 import gapic_version as package_version

__version__ = package_version.__version__



from .types.data import AIEnabledDevicesInputConfig
from .types.data import Analysis
from .types.data import AnalysisDefinition
from .types.data import AnalysisEventData
from .types.data import AnalyzerDefinition
from .types.data import Application
from .types.data import ApplicationConfigs
from .types.data import ApplicationEventData
from .types.data import AttributeValue
from .types.data import AutoscalingMetricSpec
from .types.data import BigQueryConfig
from .types.data import Cluster
from .types.data import ClusterEventData
from .types.data import CustomProcessorSourceInfo
from .types.data import DedicatedResources
from .types.data import Draft
from .types.data import DraftEventData
from .types.data import Event
from .types.data import EventEventData
from .types.data import GcsSource
from .types.data import GeneralObjectDetectionConfig
from .types.data import MachineSpec
from .types.data import MediaWarehouseConfig
from .types.data import Node
from .types.data import NormalizedPolygon
from .types.data import NormalizedPolyline
from .types.data import NormalizedVertex
from .types.data import OccupancyCountConfig
from .types.data import PersonalProtectiveEquipmentDetectionConfig
from .types.data import PersonBlurConfig
from .types.data import PersonVehicleDetectionConfig
from .types.data import Process
from .types.data import ProcessEventData
from .types.data import Processor
from .types.data import ProcessorConfig
from .types.data import ProcessorEventData
from .types.data import ProcessorIOSpec
from .types.data import RunStatus
from .types.data import Series
from .types.data import SeriesEventData
from .types.data import Stream
from .types.data import StreamAnnotation
from .types.data import StreamEventData
from .types.data import StreamWithAnnotation
from .types.data import VertexAutoMLVideoConfig
from .types.data import VertexAutoMLVisionConfig
from .types.data import VertexCustomConfig
from .types.data import VideoStreamInputConfig
from .types.data import AcceleratorType
from .types.data import DataType
from .types.data import ModelType
from .types.data import RunMode
from .types.data import StreamAnnotationType

__all__ = (
'AIEnabledDevicesInputConfig',
'AcceleratorType',
'Analysis',
'AnalysisDefinition',
'AnalysisEventData',
'AnalyzerDefinition',
'Application',
'ApplicationConfigs',
'ApplicationEventData',
'AttributeValue',
'AutoscalingMetricSpec',
'BigQueryConfig',
'Cluster',
'ClusterEventData',
'CustomProcessorSourceInfo',
'DataType',
'DedicatedResources',
'Draft',
'DraftEventData',
'Event',
'EventEventData',
'GcsSource',
'GeneralObjectDetectionConfig',
'MachineSpec',
'MediaWarehouseConfig',
'ModelType',
'Node',
'NormalizedPolygon',
'NormalizedPolyline',
'NormalizedVertex',
'OccupancyCountConfig',
'PersonBlurConfig',
'PersonVehicleDetectionConfig',
'PersonalProtectiveEquipmentDetectionConfig',
'Process',
'ProcessEventData',
'Processor',
'ProcessorConfig',
'ProcessorEventData',
'ProcessorIOSpec',
'RunMode',
'RunStatus',
'Series',
'SeriesEventData',
'Stream',
'StreamAnnotation',
'StreamAnnotationType',
'StreamEventData',
'StreamWithAnnotation',
'VertexAutoMLVideoConfig',
'VertexAutoMLVisionConfig',
'VertexCustomConfig',
'VideoStreamInputConfig',
)
