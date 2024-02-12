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
from google.events.cloud.visionai import gapic_version as package_version

__version__ = package_version.__version__



from google.events.cloud.visionai_v1.types.data import AIEnabledDevicesInputConfig
from google.events.cloud.visionai_v1.types.data import Analysis
from google.events.cloud.visionai_v1.types.data import AnalysisDefinition
from google.events.cloud.visionai_v1.types.data import AnalysisEventData
from google.events.cloud.visionai_v1.types.data import AnalyzerDefinition
from google.events.cloud.visionai_v1.types.data import Application
from google.events.cloud.visionai_v1.types.data import ApplicationConfigs
from google.events.cloud.visionai_v1.types.data import ApplicationEventData
from google.events.cloud.visionai_v1.types.data import AttributeValue
from google.events.cloud.visionai_v1.types.data import AutoscalingMetricSpec
from google.events.cloud.visionai_v1.types.data import BigQueryConfig
from google.events.cloud.visionai_v1.types.data import Cluster
from google.events.cloud.visionai_v1.types.data import ClusterEventData
from google.events.cloud.visionai_v1.types.data import CustomProcessorSourceInfo
from google.events.cloud.visionai_v1.types.data import DedicatedResources
from google.events.cloud.visionai_v1.types.data import Draft
from google.events.cloud.visionai_v1.types.data import DraftEventData
from google.events.cloud.visionai_v1.types.data import Event
from google.events.cloud.visionai_v1.types.data import EventEventData
from google.events.cloud.visionai_v1.types.data import GcsSource
from google.events.cloud.visionai_v1.types.data import GeneralObjectDetectionConfig
from google.events.cloud.visionai_v1.types.data import MachineSpec
from google.events.cloud.visionai_v1.types.data import MediaWarehouseConfig
from google.events.cloud.visionai_v1.types.data import Node
from google.events.cloud.visionai_v1.types.data import NormalizedPolygon
from google.events.cloud.visionai_v1.types.data import NormalizedPolyline
from google.events.cloud.visionai_v1.types.data import NormalizedVertex
from google.events.cloud.visionai_v1.types.data import OccupancyCountConfig
from google.events.cloud.visionai_v1.types.data import PersonalProtectiveEquipmentDetectionConfig
from google.events.cloud.visionai_v1.types.data import PersonBlurConfig
from google.events.cloud.visionai_v1.types.data import PersonVehicleDetectionConfig
from google.events.cloud.visionai_v1.types.data import Process
from google.events.cloud.visionai_v1.types.data import ProcessEventData
from google.events.cloud.visionai_v1.types.data import Processor
from google.events.cloud.visionai_v1.types.data import ProcessorConfig
from google.events.cloud.visionai_v1.types.data import ProcessorEventData
from google.events.cloud.visionai_v1.types.data import ProcessorIOSpec
from google.events.cloud.visionai_v1.types.data import RunStatus
from google.events.cloud.visionai_v1.types.data import Series
from google.events.cloud.visionai_v1.types.data import SeriesEventData
from google.events.cloud.visionai_v1.types.data import Stream
from google.events.cloud.visionai_v1.types.data import StreamAnnotation
from google.events.cloud.visionai_v1.types.data import StreamEventData
from google.events.cloud.visionai_v1.types.data import StreamWithAnnotation
from google.events.cloud.visionai_v1.types.data import VertexAutoMLVideoConfig
from google.events.cloud.visionai_v1.types.data import VertexAutoMLVisionConfig
from google.events.cloud.visionai_v1.types.data import VertexCustomConfig
from google.events.cloud.visionai_v1.types.data import VideoStreamInputConfig
from google.events.cloud.visionai_v1.types.data import AcceleratorType
from google.events.cloud.visionai_v1.types.data import DataType
from google.events.cloud.visionai_v1.types.data import ModelType
from google.events.cloud.visionai_v1.types.data import RunMode
from google.events.cloud.visionai_v1.types.data import StreamAnnotationType

__all__ = ('AIEnabledDevicesInputConfig',
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
    'DedicatedResources',
    'Draft',
    'DraftEventData',
    'Event',
    'EventEventData',
    'GcsSource',
    'GeneralObjectDetectionConfig',
    'MachineSpec',
    'MediaWarehouseConfig',
    'Node',
    'NormalizedPolygon',
    'NormalizedPolyline',
    'NormalizedVertex',
    'OccupancyCountConfig',
    'PersonalProtectiveEquipmentDetectionConfig',
    'PersonBlurConfig',
    'PersonVehicleDetectionConfig',
    'Process',
    'ProcessEventData',
    'Processor',
    'ProcessorConfig',
    'ProcessorEventData',
    'ProcessorIOSpec',
    'RunStatus',
    'Series',
    'SeriesEventData',
    'Stream',
    'StreamAnnotation',
    'StreamEventData',
    'StreamWithAnnotation',
    'VertexAutoMLVideoConfig',
    'VertexAutoMLVisionConfig',
    'VertexCustomConfig',
    'VideoStreamInputConfig',
    'AcceleratorType',
    'DataType',
    'ModelType',
    'RunMode',
    'StreamAnnotationType',
)
