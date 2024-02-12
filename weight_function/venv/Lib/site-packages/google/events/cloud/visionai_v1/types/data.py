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
from __future__ import annotations

from typing import MutableMapping, MutableSequence

import proto  # type: ignore

from google.protobuf import duration_pb2  # type: ignore
from google.protobuf import timestamp_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.visionai.v1',
    manifest={
        'StreamAnnotationType',
        'RunMode',
        'ModelType',
        'AcceleratorType',
        'DataType',
        'StreamAnnotation',
        'NormalizedPolygon',
        'NormalizedPolyline',
        'NormalizedVertex',
        'Cluster',
        'GcsSource',
        'AttributeValue',
        'AnalyzerDefinition',
        'AnalysisDefinition',
        'RunStatus',
        'Analysis',
        'Process',
        'Application',
        'ApplicationConfigs',
        'Node',
        'Draft',
        'Processor',
        'ProcessorIOSpec',
        'CustomProcessorSourceInfo',
        'ProcessorConfig',
        'StreamWithAnnotation',
        'VideoStreamInputConfig',
        'AIEnabledDevicesInputConfig',
        'MediaWarehouseConfig',
        'PersonBlurConfig',
        'OccupancyCountConfig',
        'PersonVehicleDetectionConfig',
        'PersonalProtectiveEquipmentDetectionConfig',
        'GeneralObjectDetectionConfig',
        'BigQueryConfig',
        'VertexAutoMLVisionConfig',
        'VertexAutoMLVideoConfig',
        'VertexCustomConfig',
        'MachineSpec',
        'AutoscalingMetricSpec',
        'DedicatedResources',
        'Stream',
        'Event',
        'Series',
        'SeriesEventData',
        'DraftEventData',
        'ProcessorEventData',
        'AnalysisEventData',
        'ClusterEventData',
        'EventEventData',
        'ProcessEventData',
        'StreamEventData',
        'ApplicationEventData',
    },
)


class StreamAnnotationType(proto.Enum):
    r"""Enum describing all possible types of a stream annotation.

    Values:
        STREAM_ANNOTATION_TYPE_UNSPECIFIED (0):
            Type UNSPECIFIED.
        STREAM_ANNOTATION_TYPE_ACTIVE_ZONE (1):
            active_zone annotation defines a polygon on top of the
            content from an image/video based stream, following
            processing will only focus on the content inside the active
            zone.
        STREAM_ANNOTATION_TYPE_CROSSING_LINE (2):
            crossing_line annotation defines a polyline on top of the
            content from an image/video based Vision AI stream, events
            happening across the line will be captured. For example, the
            counts of people who goes acroos the line in Occupancy
            Analytic Processor.
    """
    STREAM_ANNOTATION_TYPE_UNSPECIFIED = 0
    STREAM_ANNOTATION_TYPE_ACTIVE_ZONE = 1
    STREAM_ANNOTATION_TYPE_CROSSING_LINE = 2


class RunMode(proto.Enum):
    r"""RunMode represents the mode to launch the Process on.

    Values:
        RUN_MODE_UNSPECIFIED (0):
            Mode is unspecified.
        LIVE (1):
            Live mode. Meaning the Process is launched to
            handle live video source, and possible packet
            drops are expected.
        SUBMISSION (2):
            Submission mode. Meaning the Process is
            launched to handle bounded video files, with no
            packet drop. Completion status is tracked.
    """
    RUN_MODE_UNSPECIFIED = 0
    LIVE = 1
    SUBMISSION = 2


class ModelType(proto.Enum):
    r"""All the supported model types in Vision AI App Platform.

    Values:
        MODEL_TYPE_UNSPECIFIED (0):
            Processor Type UNSPECIFIED.
        IMAGE_CLASSIFICATION (1):
            Model Type Image Classification.
        OBJECT_DETECTION (2):
            Model Type Object Detection.
        VIDEO_CLASSIFICATION (3):
            Model Type Video Classification.
        VIDEO_OBJECT_TRACKING (4):
            Model Type Object Tracking.
        VIDEO_ACTION_RECOGNITION (5):
            Model Type Action Recognition.
        OCCUPANCY_COUNTING (6):
            Model Type Occupancy Counting.
        PERSON_BLUR (7):
            Model Type Person Blur.
        VERTEX_CUSTOM (8):
            Model Type Vertex Custom.
    """
    MODEL_TYPE_UNSPECIFIED = 0
    IMAGE_CLASSIFICATION = 1
    OBJECT_DETECTION = 2
    VIDEO_CLASSIFICATION = 3
    VIDEO_OBJECT_TRACKING = 4
    VIDEO_ACTION_RECOGNITION = 5
    OCCUPANCY_COUNTING = 6
    PERSON_BLUR = 7
    VERTEX_CUSTOM = 8


class AcceleratorType(proto.Enum):
    r"""Represents a hardware accelerator type.

    Values:
        ACCELERATOR_TYPE_UNSPECIFIED (0):
            Unspecified accelerator type, which means no
            accelerator.
        NVIDIA_TESLA_K80 (1):
            Nvidia Tesla K80 GPU.
        NVIDIA_TESLA_P100 (2):
            Nvidia Tesla P100 GPU.
        NVIDIA_TESLA_V100 (3):
            Nvidia Tesla V100 GPU.
        NVIDIA_TESLA_P4 (4):
            Nvidia Tesla P4 GPU.
        NVIDIA_TESLA_T4 (5):
            Nvidia Tesla T4 GPU.
        NVIDIA_TESLA_A100 (8):
            Nvidia Tesla A100 GPU.
        TPU_V2 (6):
            TPU v2.
        TPU_V3 (7):
            TPU v3.
    """
    ACCELERATOR_TYPE_UNSPECIFIED = 0
    NVIDIA_TESLA_K80 = 1
    NVIDIA_TESLA_P100 = 2
    NVIDIA_TESLA_V100 = 3
    NVIDIA_TESLA_P4 = 4
    NVIDIA_TESLA_T4 = 5
    NVIDIA_TESLA_A100 = 8
    TPU_V2 = 6
    TPU_V3 = 7


class DataType(proto.Enum):
    r"""All supported data types.

    Values:
        DATA_TYPE_UNSPECIFIED (0):
            The default value of DataType.
        VIDEO (1):
            Video data type like H264.
        IMAGE (3):
            Image data type.
        PROTO (2):
            Protobuf data type, usually used for general
            data blob.
    """
    DATA_TYPE_UNSPECIFIED = 0
    VIDEO = 1
    IMAGE = 3
    PROTO = 2


class StreamAnnotation(proto.Message):
    r"""message about annotations about Vision AI stream resource.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        active_zone (google.events.cloud.visionai_v1.types.NormalizedPolygon):
            Annotation for type ACTIVE_ZONE

            This field is a member of `oneof`_ ``annotation_payload``.
        crossing_line (google.events.cloud.visionai_v1.types.NormalizedPolyline):
            Annotation for type CROSSING_LINE

            This field is a member of `oneof`_ ``annotation_payload``.
        id (str):
            ID of the annotation. It must be unique when
            used in the certain context. For example, all
            the annotations to one input streams of a Vision
            AI application.
        display_name (str):
            User-friendly name for the annotation.
        source_stream (str):
            The Vision AI stream resource name.
        type_ (google.events.cloud.visionai_v1.types.StreamAnnotationType):
            The actual type of Annotation.
    """

    active_zone: 'NormalizedPolygon' = proto.Field(
        proto.MESSAGE,
        number=5,
        oneof='annotation_payload',
        message='NormalizedPolygon',
    )
    crossing_line: 'NormalizedPolyline' = proto.Field(
        proto.MESSAGE,
        number=6,
        oneof='annotation_payload',
        message='NormalizedPolyline',
    )
    id: str = proto.Field(
        proto.STRING,
        number=1,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    source_stream: str = proto.Field(
        proto.STRING,
        number=3,
    )
    type_: 'StreamAnnotationType' = proto.Field(
        proto.ENUM,
        number=4,
        enum='StreamAnnotationType',
    )


class NormalizedPolygon(proto.Message):
    r"""Normalized Polygon.

    Attributes:
        normalized_vertices (MutableSequence[google.events.cloud.visionai_v1.types.NormalizedVertex]):
            The bounding polygon normalized vertices. Top left corner of
            the image will be [0, 0].
    """

    normalized_vertices: MutableSequence['NormalizedVertex'] = proto.RepeatedField(
        proto.MESSAGE,
        number=1,
        message='NormalizedVertex',
    )


class NormalizedPolyline(proto.Message):
    r"""Normalized Pplyline, which represents a curve consisting of
    connected straight-line segments.

    Attributes:
        normalized_vertices (MutableSequence[google.events.cloud.visionai_v1.types.NormalizedVertex]):
            A sequence of vertices connected by straight
            lines.
    """

    normalized_vertices: MutableSequence['NormalizedVertex'] = proto.RepeatedField(
        proto.MESSAGE,
        number=1,
        message='NormalizedVertex',
    )


class NormalizedVertex(proto.Message):
    r"""A vertex represents a 2D point in the image.
    NOTE: the normalized vertex coordinates are relative to the
    original image and range from 0 to 1.

    Attributes:
        x (float):
            X coordinate.
        y (float):
            Y coordinate.
    """

    x: float = proto.Field(
        proto.FLOAT,
        number=1,
    )
    y: float = proto.Field(
        proto.FLOAT,
        number=2,
    )


class Cluster(proto.Message):
    r"""Message describing the Cluster object.

    Attributes:
        name (str):
            Output only. Name of the resource.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The create timestamp.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The update timestamp.
        labels (MutableMapping[str, str]):
            Labels as key value pairs
        annotations (MutableMapping[str, str]):
            Annotations to allow clients to store small
            amounts of arbitrary data.
        dataplane_service_endpoint (str):
            Output only. The DNS name of the data plane
            service
        state (google.events.cloud.visionai_v1.types.Cluster.State):
            Output only. The current state of the
            cluster.
        psc_target (str):
            Output only. The private service connection
            service target name.
    """
    class State(proto.Enum):
        r"""The current state of the cluster.

        Values:
            STATE_UNSPECIFIED (0):
                Not set.
            PROVISIONING (1):
                The PROVISIONING state indicates the cluster
                is being created.
            RUNNING (2):
                The RUNNING state indicates the cluster has
                been created and is fully usable.
            STOPPING (3):
                The STOPPING state indicates the cluster is
                being deleted.
            ERROR (4):
                The ERROR state indicates the cluster is
                unusable. It will be automatically deleted.
        """
        STATE_UNSPECIFIED = 0
        PROVISIONING = 1
        RUNNING = 2
        STOPPING = 3
        ERROR = 4

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    annotations: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=5,
    )
    dataplane_service_endpoint: str = proto.Field(
        proto.STRING,
        number=6,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=7,
        enum=State,
    )
    psc_target: str = proto.Field(
        proto.STRING,
        number=8,
    )


class GcsSource(proto.Message):
    r"""The Google Cloud Storage location for the input content.

    Attributes:
        uris (MutableSequence[str]):
            Required. References to a Google Cloud
            Storage paths.
    """

    uris: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=1,
    )


class AttributeValue(proto.Message):
    r"""Represents an actual value of an operator attribute.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        i (int):
            int.

            This field is a member of `oneof`_ ``value``.
        f (float):
            float.

            This field is a member of `oneof`_ ``value``.
        b (bool):
            bool.

            This field is a member of `oneof`_ ``value``.
        s (bytes):
            string.

            This field is a member of `oneof`_ ``value``.
    """

    i: int = proto.Field(
        proto.INT64,
        number=1,
        oneof='value',
    )
    f: float = proto.Field(
        proto.FLOAT,
        number=2,
        oneof='value',
    )
    b: bool = proto.Field(
        proto.BOOL,
        number=3,
        oneof='value',
    )
    s: bytes = proto.Field(
        proto.BYTES,
        number=4,
        oneof='value',
    )


class AnalyzerDefinition(proto.Message):
    r"""Defines an Analyzer.

    An analyzer processes data from its input streams using the
    logic defined in the Operator that it represents. Of course, it
    produces data for the output streams declared in the Operator.

    Attributes:
        analyzer (str):
            The name of this analyzer.

            Tentatively [a-z][a-z0-9]\ *(_[a-z0-9]+)*.
        operator (str):
            The name of the operator that this analyzer
            runs.
            Must match the name of a supported operator.
        inputs (MutableSequence[google.events.cloud.visionai_v1.types.AnalyzerDefinition.StreamInput]):
            Input streams.
        attrs (MutableMapping[str, google.events.cloud.visionai_v1.types.AttributeValue]):
            The attribute values that this analyzer
            applies to the operator.
            Supply a mapping between the attribute names and
            the actual value you wish to apply. If an
            attribute name is omitted, then it will take a
            preconfigured default value.
        debug_options (google.events.cloud.visionai_v1.types.AnalyzerDefinition.DebugOptions):
            Debug options.
    """

    class StreamInput(proto.Message):
        r"""The inputs to this analyzer.

        We accept input name references of the following form: :

        Example:

        Suppose you had an operator named "SomeOp" that has 2 output
        arguments, the first of which is named "foo" and the second of which
        is named "bar", and an operator named "MyOp" that accepts 2 inputs.

        Also suppose that there is an analyzer named "some-analyzer" that is
        running "SomeOp" and another analyzer named "my-analyzer" running
        "MyOp".

        To indicate that "my-analyzer" is to consume "some-analyzer"'s "foo"
        output as its first input and "some-analyzer"'s "bar" output as its
        second input, you can set this field to the following: input =
        ["some-analyzer:foo", "some-analyzer:bar"]

        Attributes:
            input (str):
                The name of the stream input (as discussed
                above).
        """

        input: str = proto.Field(
            proto.STRING,
            number=1,
        )

    class DebugOptions(proto.Message):
        r"""Options available for debugging purposes only.

        Attributes:
            environment_variables (MutableMapping[str, str]):
                Environment variables.
        """

        environment_variables: MutableMapping[str, str] = proto.MapField(
            proto.STRING,
            proto.STRING,
            number=1,
        )

    analyzer: str = proto.Field(
        proto.STRING,
        number=1,
    )
    operator: str = proto.Field(
        proto.STRING,
        number=2,
    )
    inputs: MutableSequence[StreamInput] = proto.RepeatedField(
        proto.MESSAGE,
        number=3,
        message=StreamInput,
    )
    attrs: MutableMapping[str, 'AttributeValue'] = proto.MapField(
        proto.STRING,
        proto.MESSAGE,
        number=4,
        message='AttributeValue',
    )
    debug_options: DebugOptions = proto.Field(
        proto.MESSAGE,
        number=5,
        message=DebugOptions,
    )


class AnalysisDefinition(proto.Message):
    r"""Defines a full analysis.

    This is a description of the overall live analytics pipeline.
    You may think of this as an edge list representation of a
    multigraph.

    This may be directly authored by a human in protobuf textformat,
    or it may be generated by a programming API (perhaps Python or
    JavaScript depending on context).

    Attributes:
        analyzers (MutableSequence[google.events.cloud.visionai_v1.types.AnalyzerDefinition]):
            Analyzer definitions.
    """

    analyzers: MutableSequence['AnalyzerDefinition'] = proto.RepeatedField(
        proto.MESSAGE,
        number=1,
        message='AnalyzerDefinition',
    )


class RunStatus(proto.Message):
    r"""Message describing the status of the Process.

    Attributes:
        state (google.events.cloud.visionai_v1.types.RunStatus.State):
            The state of the Process.
        reason (str):
            The reason of becoming the state.
    """
    class State(proto.Enum):
        r"""State represents the running status of the Process.

        Values:
            STATE_UNSPECIFIED (0):
                State is unspecified.
            INITIALIZING (1):
                INITIALIZING means the Process is scheduled
                but yet ready to handle real traffic.
            RUNNING (2):
                RUNNING means the Process is up running and
                handling traffic.
            COMPLETED (3):
                COMPLETED means the Process has completed the
                processing, especially for non-streaming use
                case.
            FAILED (4):
                FAILED means the Process failed to complete
                the processing.
            PENDING (5):
                PENDING means the Process is created but yet
                to be scheduled.
        """
        STATE_UNSPECIFIED = 0
        INITIALIZING = 1
        RUNNING = 2
        COMPLETED = 3
        FAILED = 4
        PENDING = 5

    state: State = proto.Field(
        proto.ENUM,
        number=1,
        enum=State,
    )
    reason: str = proto.Field(
        proto.STRING,
        number=2,
    )


class Analysis(proto.Message):
    r"""Message describing the Analysis object.

    Attributes:
        name (str):
            The name of resource.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The create timestamp.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The update timestamp.
        labels (MutableMapping[str, str]):
            Labels as key value pairs.
        analysis_definition (google.events.cloud.visionai_v1.types.AnalysisDefinition):
            The definition of the analysis.
        input_streams_mapping (MutableMapping[str, str]):
            Map from the input parameter in the definition to the real
            stream. E.g., suppose you had a stream source operator named
            "input-0" and you try to receive from the real stream
            "stream-0". You can add the following mapping: [input-0:
            stream-0].
        output_streams_mapping (MutableMapping[str, str]):
            Map from the output parameter in the definition to the real
            stream. E.g., suppose you had a stream sink operator named
            "output-0" and you try to send to the real stream
            "stream-0". You can add the following mapping: [output-0:
            stream-0].
        disable_event_watch (bool):
            Boolean flag to indicate whether you would
            like to disable the ability to automatically
            start a Process when new event happening in the
            input Stream. If you would like to start a
            Process manually, the field needs to be set to
            true.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    analysis_definition: 'AnalysisDefinition' = proto.Field(
        proto.MESSAGE,
        number=5,
        message='AnalysisDefinition',
    )
    input_streams_mapping: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=6,
    )
    output_streams_mapping: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=7,
    )
    disable_event_watch: bool = proto.Field(
        proto.BOOL,
        number=8,
    )


class Process(proto.Message):
    r"""Message describing the Process object.

    Attributes:
        name (str):
            The name of resource.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The create timestamp.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The update timestamp.
        analysis (str):
            Required. Reference to an existing Analysis
            resource.
        attribute_overrides (MutableSequence[str]):
            Optional. Attribute overrides of the Analyzers. Format for
            each single override item:
            "{analyzer_name}:{attribute_key}={value}".
        run_status (google.events.cloud.visionai_v1.types.RunStatus):
            Optional. Status of the Process.
        run_mode (google.events.cloud.visionai_v1.types.RunMode):
            Optional. Run mode of the Process.
        event_id (str):
            Optional. Event ID of the input/output
            streams. This is useful when you have a
            StreamSource/StreamSink operator in the
            Analysis, and you want to manually specify the
            Event to read from/write to.
        batch_id (str):
            Optional. Optional: Batch ID of the Process.
        retry_count (int):
            Optional. Optional: The number of retries for
            a process in submission mode the system should
            try before declaring failure. By default, no
            retry will be performed.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    analysis: str = proto.Field(
        proto.STRING,
        number=4,
    )
    attribute_overrides: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=5,
    )
    run_status: 'RunStatus' = proto.Field(
        proto.MESSAGE,
        number=6,
        message='RunStatus',
    )
    run_mode: 'RunMode' = proto.Field(
        proto.ENUM,
        number=7,
        enum='RunMode',
    )
    event_id: str = proto.Field(
        proto.STRING,
        number=8,
    )
    batch_id: str = proto.Field(
        proto.STRING,
        number=9,
    )
    retry_count: int = proto.Field(
        proto.INT32,
        number=10,
    )


class Application(proto.Message):
    r"""Message describing Application object

    Attributes:
        name (str):
            name of resource
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. [Output only] Create timestamp
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. [Output only] Update timestamp
        labels (MutableMapping[str, str]):
            Labels as key value pairs
        display_name (str):
            Required. A user friendly display name for
            the solution.
        description (str):
            A description for this application.
        application_configs (google.events.cloud.visionai_v1.types.ApplicationConfigs):
            Application graph configuration.
        runtime_info (google.events.cloud.visionai_v1.types.Application.ApplicationRuntimeInfo):
            Output only. Application graph runtime info.
            Only exists when application state equals to
            DEPLOYED.
        state (google.events.cloud.visionai_v1.types.Application.State):
            Output only. State of the application.
        billing_mode (google.events.cloud.visionai_v1.types.Application.BillingMode):
            Billing mode of the application.
    """
    class State(proto.Enum):
        r"""State of the Application

        Values:
            STATE_UNSPECIFIED (0):
                The default value. This value is used if the
                state is omitted.
            CREATED (1):
                State CREATED.
            DEPLOYING (2):
                State DEPLOYING.
            DEPLOYED (3):
                State DEPLOYED.
            UNDEPLOYING (4):
                State UNDEPLOYING.
            DELETED (5):
                State DELETED.
            ERROR (6):
                State ERROR.
            CREATING (7):
                State CREATING.
            UPDATING (8):
                State Updating.
            DELETING (9):
                State Deleting.
            FIXING (10):
                State Fixing.
        """
        STATE_UNSPECIFIED = 0
        CREATED = 1
        DEPLOYING = 2
        DEPLOYED = 3
        UNDEPLOYING = 4
        DELETED = 5
        ERROR = 6
        CREATING = 7
        UPDATING = 8
        DELETING = 9
        FIXING = 10

    class BillingMode(proto.Enum):
        r"""Billing mode of the Application

        Values:
            BILLING_MODE_UNSPECIFIED (0):
                The default value.
            PAYG (1):
                Pay as you go billing mode.
            MONTHLY (2):
                Monthly billing mode.
        """
        BILLING_MODE_UNSPECIFIED = 0
        PAYG = 1
        MONTHLY = 2

    class ApplicationRuntimeInfo(proto.Message):
        r"""Message storing the runtime information of the application.

        Attributes:
            deploy_time (google.protobuf.timestamp_pb2.Timestamp):
                Timestamp when the engine be deployed
            global_output_resources (MutableSequence[google.events.cloud.visionai_v1.types.Application.ApplicationRuntimeInfo.GlobalOutputResource]):
                Globally created resources like warehouse
                dataschemas.
            monitoring_config (google.events.cloud.visionai_v1.types.Application.ApplicationRuntimeInfo.MonitoringConfig):
                Monitoring-related configuration for this
                application.
        """

        class GlobalOutputResource(proto.Message):
            r"""Message about output resources from application.

            Attributes:
                output_resource (str):
                    The full resource name of the outputted
                    resources.
                producer_node (str):
                    The name of graph node who produces the output resource
                    name. For example: output_resource:
                    /projects/123/locations/us-central1/corpora/my-corpus/dataSchemas/my-schema
                    producer_node: occupancy-count
                key (str):
                    The key of the output resource, it has to be
                    unique within the same producer node. One
                    producer node can output several output
                    resources, the key can be used to match
                    corresponding output resources.
            """

            output_resource: str = proto.Field(
                proto.STRING,
                number=1,
            )
            producer_node: str = proto.Field(
                proto.STRING,
                number=2,
            )
            key: str = proto.Field(
                proto.STRING,
                number=3,
            )

        class MonitoringConfig(proto.Message):
            r"""Monitoring-related configuration for an application.

            Attributes:
                enabled (bool):
                    Whether this application has monitoring
                    enabled.
            """

            enabled: bool = proto.Field(
                proto.BOOL,
                number=1,
            )

        deploy_time: timestamp_pb2.Timestamp = proto.Field(
            proto.MESSAGE,
            number=1,
            message=timestamp_pb2.Timestamp,
        )
        global_output_resources: MutableSequence['Application.ApplicationRuntimeInfo.GlobalOutputResource'] = proto.RepeatedField(
            proto.MESSAGE,
            number=3,
            message='Application.ApplicationRuntimeInfo.GlobalOutputResource',
        )
        monitoring_config: 'Application.ApplicationRuntimeInfo.MonitoringConfig' = proto.Field(
            proto.MESSAGE,
            number=4,
            message='Application.ApplicationRuntimeInfo.MonitoringConfig',
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=5,
    )
    description: str = proto.Field(
        proto.STRING,
        number=6,
    )
    application_configs: 'ApplicationConfigs' = proto.Field(
        proto.MESSAGE,
        number=7,
        message='ApplicationConfigs',
    )
    runtime_info: ApplicationRuntimeInfo = proto.Field(
        proto.MESSAGE,
        number=8,
        message=ApplicationRuntimeInfo,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=9,
        enum=State,
    )
    billing_mode: BillingMode = proto.Field(
        proto.ENUM,
        number=12,
        enum=BillingMode,
    )


class ApplicationConfigs(proto.Message):
    r"""Message storing the graph of the application.

    Attributes:
        nodes (MutableSequence[google.events.cloud.visionai_v1.types.Node]):
            A list of nodes  in the application graph.
    """

    nodes: MutableSequence['Node'] = proto.RepeatedField(
        proto.MESSAGE,
        number=1,
        message='Node',
    )


class Node(proto.Message):
    r"""Message describing node object.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        output_all_output_channels_to_stream (bool):
            By default, the output of the node will only be available to
            downstream nodes. To consume the direct output from the
            application node, the output must be sent to Vision AI
            Streams at first.

            By setting output_all_output_channels_to_stream to true, App
            Platform will automatically send all the outputs of the
            current node to Vision AI Stream resources (one stream per
            output channel). The output stream resource will be created
            by App Platform automatically during deployment and deleted
            after application un-deployment. Note that this config
            applies to all the Application Instances.

            The output stream can be override at instance level by
            configuring the ``output_resources`` section of Instance
            resource. ``producer_node`` should be current node,
            ``output_resource_binding`` should be the output channel
            name (or leave it blank if there is only 1 output channel of
            the processor) and ``output_resource`` should be the target
            output stream.

            This field is a member of `oneof`_ ``stream_output_config``.
        name (str):
            Required. A unique name for the node.
        display_name (str):
            A user friendly display name for the node.
        node_config (google.events.cloud.visionai_v1.types.ProcessorConfig):
            Node config.
        processor (str):
            Processor name refer to the chosen processor
            resource.
        parents (MutableSequence[google.events.cloud.visionai_v1.types.Node.InputEdge]):
            Parent node. Input node should not have
            parent node. For V1 Alpha1/Beta only media
            warehouse node can have multiple parents, other
            types of nodes will only have one parent.
    """

    class InputEdge(proto.Message):
        r"""Message describing one edge pointing into a node.

        Attributes:
            parent_node (str):
                The name of the parent node.
            parent_output_channel (str):
                The connected output artifact of the parent
                node. It can be omitted if target processor only
                has 1 output artifact.
            connected_input_channel (str):
                The connected input channel of the current
                node's processor. It can be omitted if target
                processor only has 1 input channel.
        """

        parent_node: str = proto.Field(
            proto.STRING,
            number=1,
        )
        parent_output_channel: str = proto.Field(
            proto.STRING,
            number=2,
        )
        connected_input_channel: str = proto.Field(
            proto.STRING,
            number=3,
        )

    output_all_output_channels_to_stream: bool = proto.Field(
        proto.BOOL,
        number=6,
        oneof='stream_output_config',
    )
    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    node_config: 'ProcessorConfig' = proto.Field(
        proto.MESSAGE,
        number=3,
        message='ProcessorConfig',
    )
    processor: str = proto.Field(
        proto.STRING,
        number=4,
    )
    parents: MutableSequence[InputEdge] = proto.RepeatedField(
        proto.MESSAGE,
        number=5,
        message=InputEdge,
    )


class Draft(proto.Message):
    r"""Message describing Draft object

    Attributes:
        name (str):
            name of resource
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. [Output only] Create timestamp
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. [Output only] Create timestamp
        labels (MutableMapping[str, str]):
            Labels as key value pairs
        display_name (str):
            Required. A user friendly display name for
            the solution.
        description (str):
            A description for this application.
        draft_application_configs (google.events.cloud.visionai_v1.types.ApplicationConfigs):
            The draft application configs which haven't
            been updated to an application.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=7,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=3,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=4,
    )
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    draft_application_configs: 'ApplicationConfigs' = proto.Field(
        proto.MESSAGE,
        number=6,
        message='ApplicationConfigs',
    )


class Processor(proto.Message):
    r"""Message describing Processor object.
    Next ID: 19

    Attributes:
        name (str):
            name of resource.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. [Output only] Create timestamp.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. [Output only] Update timestamp.
        labels (MutableMapping[str, str]):
            Labels as key value pairs.
        display_name (str):
            Required. A user friendly display name for
            the processor.
        description (str):
            Illustrative sentences for describing the
            functionality of the processor.
        processor_type (google.events.cloud.visionai_v1.types.Processor.ProcessorType):
            Output only. Processor Type.
        model_type (google.events.cloud.visionai_v1.types.ModelType):
            Model Type.
        custom_processor_source_info (google.events.cloud.visionai_v1.types.CustomProcessorSourceInfo):
            Source info for customer created processor.
        state (google.events.cloud.visionai_v1.types.Processor.ProcessorState):
            Output only. State of the Processor.
        processor_io_spec (google.events.cloud.visionai_v1.types.ProcessorIOSpec):
            Output only. [Output only] The input / output specifications
            of a processor, each type of processor has fixed input /
            output specs which cannot be altered by customer.
        configuration_typeurl (str):
            Output only. The corresponding configuration
            can be used in the Application to customize the
            behavior of the processor.
        supported_annotation_types (MutableSequence[google.events.cloud.visionai_v1.types.StreamAnnotationType]):

        supports_post_processing (bool):
            Indicates if the processor supports post
            processing.
    """
    class ProcessorType(proto.Enum):
        r"""Type

        Values:
            PROCESSOR_TYPE_UNSPECIFIED (0):
                Processor Type UNSPECIFIED.
            PRETRAINED (1):
                Processor Type PRETRAINED.
                Pretrained processor is developed by Vision AI
                App Platform with state-of-the-art vision data
                processing functionality, like occupancy
                counting or person blur. Pretrained processor is
                usually publicly available.
            CUSTOM (2):
                Processor Type CUSTOM.
                Custom processors are specialized processors
                which are either uploaded by customers or
                imported from other GCP platform (for example
                Vertex AI). Custom processor is only visible to
                the creator.
            CONNECTOR (3):
                Processor Type CONNECTOR.
                Connector processors are special processors
                which perform I/O for the application, they do
                not processing the data but either deliver the
                data to other processors or receive data from
                other processors.
        """
        PROCESSOR_TYPE_UNSPECIFIED = 0
        PRETRAINED = 1
        CUSTOM = 2
        CONNECTOR = 3

    class ProcessorState(proto.Enum):
        r"""

        Values:
            PROCESSOR_STATE_UNSPECIFIED (0):
                Unspecified Processor state.
            CREATING (1):
                Processor is being created (not ready for
                use).
            ACTIVE (2):
                Processor is and ready for use.
            DELETING (3):
                Processor is being deleted (not ready for
                use).
            FAILED (4):
                Processor deleted or creation failed .
        """
        PROCESSOR_STATE_UNSPECIFIED = 0
        CREATING = 1
        ACTIVE = 2
        DELETING = 3
        FAILED = 4

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=5,
    )
    description: str = proto.Field(
        proto.STRING,
        number=10,
    )
    processor_type: ProcessorType = proto.Field(
        proto.ENUM,
        number=6,
        enum=ProcessorType,
    )
    model_type: 'ModelType' = proto.Field(
        proto.ENUM,
        number=13,
        enum='ModelType',
    )
    custom_processor_source_info: 'CustomProcessorSourceInfo' = proto.Field(
        proto.MESSAGE,
        number=7,
        message='CustomProcessorSourceInfo',
    )
    state: ProcessorState = proto.Field(
        proto.ENUM,
        number=8,
        enum=ProcessorState,
    )
    processor_io_spec: 'ProcessorIOSpec' = proto.Field(
        proto.MESSAGE,
        number=11,
        message='ProcessorIOSpec',
    )
    configuration_typeurl: str = proto.Field(
        proto.STRING,
        number=14,
    )
    supported_annotation_types: MutableSequence['StreamAnnotationType'] = proto.RepeatedField(
        proto.ENUM,
        number=15,
        enum='StreamAnnotationType',
    )
    supports_post_processing: bool = proto.Field(
        proto.BOOL,
        number=17,
    )


class ProcessorIOSpec(proto.Message):
    r"""Message describing the input / output specifications of a
    processor.

    Attributes:
        graph_input_channel_specs (MutableSequence[google.events.cloud.visionai_v1.types.ProcessorIOSpec.GraphInputChannelSpec]):
            For processors with input_channel_specs, the processor must
            be explicitly connected to another processor.
        graph_output_channel_specs (MutableSequence[google.events.cloud.visionai_v1.types.ProcessorIOSpec.GraphOutputChannelSpec]):
            The output artifact specifications for the
            current processor.
        instance_resource_input_binding_specs (MutableSequence[google.events.cloud.visionai_v1.types.ProcessorIOSpec.InstanceResourceInputBindingSpec]):
            The input resource that needs to be fed from
            the application instance.
        instance_resource_output_binding_specs (MutableSequence[google.events.cloud.visionai_v1.types.ProcessorIOSpec.InstanceResourceOutputBindingSpec]):
            The output resource that the processor will
            generate per instance. Other than the explicitly
            listed output bindings here, all the processors'
            GraphOutputChannels can be binded to stream
            resource. The bind name then is the same as the
            GraphOutputChannel's name.
    """

    class GraphInputChannelSpec(proto.Message):
        r"""Message for input channel specification.

        Attributes:
            name (str):
                The name of the current input channel.
            data_type (google.events.cloud.visionai_v1.types.DataType):
                The data types of the current input channel.
                When this field has more than 1 value, it means
                this input channel can be connected to either of
                these different data types.
            accepted_data_type_uris (MutableSequence[str]):
                If specified, only those detailed data types
                can be connected to the processor. For example,
                jpeg stream for MEDIA, or PredictionResult proto
                for PROTO type. If unspecified, then any proto
                is accepted.
            required (bool):
                Whether the current input channel is required
                by the processor. For example, for a processor
                with required video input and optional audio
                input, if video input is missing, the
                application will be rejected while the audio
                input can be missing as long as the video input
                exists.
            max_connection_allowed (int):
                How many input edges can be connected to this
                input channel. 0 means unlimited.
        """

        name: str = proto.Field(
            proto.STRING,
            number=1,
        )
        data_type: 'DataType' = proto.Field(
            proto.ENUM,
            number=2,
            enum='DataType',
        )
        accepted_data_type_uris: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=5,
        )
        required: bool = proto.Field(
            proto.BOOL,
            number=3,
        )
        max_connection_allowed: int = proto.Field(
            proto.INT64,
            number=4,
        )

    class GraphOutputChannelSpec(proto.Message):
        r"""Message for output channel specification.

        Attributes:
            name (str):
                The name of the current output channel.
            data_type (google.events.cloud.visionai_v1.types.DataType):
                The data type of the current output channel.
            data_type_uri (str):

        """

        name: str = proto.Field(
            proto.STRING,
            number=1,
        )
        data_type: 'DataType' = proto.Field(
            proto.ENUM,
            number=2,
            enum='DataType',
        )
        data_type_uri: str = proto.Field(
            proto.STRING,
            number=3,
        )

    class InstanceResourceInputBindingSpec(proto.Message):
        r"""Message for instance resource channel specification.
        External resources are virtual nodes which are not expressed in
        the application graph. Each processor expresses its out-graph
        spec, so customer is able to override the external source or
        destinations to the

        This message has `oneof`_ fields (mutually exclusive fields).
        For each oneof, at most one member field can be set at the same time.
        Setting any member of the oneof automatically clears all other
        members.

        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            config_type_uri (str):
                The configuration proto that includes the
                Googleapis resources. I.e.
                type.googleapis.com/google.cloud.vision.v1.StreamWithAnnotation

                This field is a member of `oneof`_ ``resource_type``.
            resource_type_uri (str):
                The direct type url of Googleapis resource.
                i.e.
                type.googleapis.com/google.cloud.vision.v1.Asset

                This field is a member of `oneof`_ ``resource_type``.
            name (str):
                Name of the input binding, unique within the
                processor.
        """

        config_type_uri: str = proto.Field(
            proto.STRING,
            number=2,
            oneof='resource_type',
        )
        resource_type_uri: str = proto.Field(
            proto.STRING,
            number=3,
            oneof='resource_type',
        )
        name: str = proto.Field(
            proto.STRING,
            number=1,
        )

    class InstanceResourceOutputBindingSpec(proto.Message):
        r"""

        Attributes:
            name (str):
                Name of the output binding, unique within the
                processor.
            resource_type_uri (str):
                The resource type uri of the acceptable
                output resource.
            explicit (bool):
                Whether the output resource needs to be
                explicitly set in the instance. If it is false,
                the processor will automatically generate it if
                required.
        """

        name: str = proto.Field(
            proto.STRING,
            number=1,
        )
        resource_type_uri: str = proto.Field(
            proto.STRING,
            number=2,
        )
        explicit: bool = proto.Field(
            proto.BOOL,
            number=3,
        )

    graph_input_channel_specs: MutableSequence[GraphInputChannelSpec] = proto.RepeatedField(
        proto.MESSAGE,
        number=3,
        message=GraphInputChannelSpec,
    )
    graph_output_channel_specs: MutableSequence[GraphOutputChannelSpec] = proto.RepeatedField(
        proto.MESSAGE,
        number=4,
        message=GraphOutputChannelSpec,
    )
    instance_resource_input_binding_specs: MutableSequence[InstanceResourceInputBindingSpec] = proto.RepeatedField(
        proto.MESSAGE,
        number=5,
        message=InstanceResourceInputBindingSpec,
    )
    instance_resource_output_binding_specs: MutableSequence[InstanceResourceOutputBindingSpec] = proto.RepeatedField(
        proto.MESSAGE,
        number=6,
        message=InstanceResourceOutputBindingSpec,
    )


class CustomProcessorSourceInfo(proto.Message):
    r"""Describes the source info for a custom processor.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        vertex_model (str):
            The resource name original model hosted in
            the vertex AI platform.

            This field is a member of `oneof`_ ``artifact_path``.
        source_type (google.events.cloud.visionai_v1.types.CustomProcessorSourceInfo.SourceType):
            The original product which holds the custom
            processor's functionality.
        additional_info (MutableMapping[str, str]):
            Output only. Additional info related to the
            imported custom processor. Data is filled in by
            app platform during the processor creation.
        model_schema (google.events.cloud.visionai_v1.types.CustomProcessorSourceInfo.ModelSchema):
            Model schema files which specifies the signature of the
            model. For VERTEX_CUSTOM models, instances schema is
            required. If instances schema is not specified during the
            processor creation, VisionAI Platform will try to get it
            from Vertex, if it doesn't exist, the creation will fail.
    """
    class SourceType(proto.Enum):
        r"""Source type of the imported custom processor.

        Values:
            SOURCE_TYPE_UNSPECIFIED (0):
                Source type unspecified.
            VERTEX_AUTOML (1):
                Custom processors coming from Vertex AutoML
                product.
            VERTEX_CUSTOM (2):
                Custom processors coming from general custom
                models from Vertex.
            PRODUCT_RECOGNIZER (3):
                Source for Product Recognizer.
        """
        SOURCE_TYPE_UNSPECIFIED = 0
        VERTEX_AUTOML = 1
        VERTEX_CUSTOM = 2
        PRODUCT_RECOGNIZER = 3

    class ModelSchema(proto.Message):
        r"""The schema is defined as an OpenAPI 3.0.2 `Schema
        Object <https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.2.md#schemaObject>`__.

        Attributes:
            instances_schema (google.events.cloud.visionai_v1.types.GcsSource):
                Cloud Storage location to a YAML file that
                defines the format of a single instance used in
                prediction and explanation requests.
            parameters_schema (google.events.cloud.visionai_v1.types.GcsSource):
                Cloud Storage location to a YAML file that
                defines the prediction and explanation
                parameters.
            predictions_schema (google.events.cloud.visionai_v1.types.GcsSource):
                Cloud Storage location to a YAML file that
                defines the format of a single prediction or
                explanation.
        """

        instances_schema: 'GcsSource' = proto.Field(
            proto.MESSAGE,
            number=1,
            message='GcsSource',
        )
        parameters_schema: 'GcsSource' = proto.Field(
            proto.MESSAGE,
            number=2,
            message='GcsSource',
        )
        predictions_schema: 'GcsSource' = proto.Field(
            proto.MESSAGE,
            number=3,
            message='GcsSource',
        )

    vertex_model: str = proto.Field(
        proto.STRING,
        number=2,
        oneof='artifact_path',
    )
    source_type: SourceType = proto.Field(
        proto.ENUM,
        number=1,
        enum=SourceType,
    )
    additional_info: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    model_schema: ModelSchema = proto.Field(
        proto.MESSAGE,
        number=5,
        message=ModelSchema,
    )


class ProcessorConfig(proto.Message):
    r"""Next ID: 29

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        video_stream_input_config (google.events.cloud.visionai_v1.types.VideoStreamInputConfig):
            Configs of stream input processor.

            This field is a member of `oneof`_ ``processor_config``.
        ai_enabled_devices_input_config (google.events.cloud.visionai_v1.types.AIEnabledDevicesInputConfig):
            Config of AI-enabled input devices.

            This field is a member of `oneof`_ ``processor_config``.
        media_warehouse_config (google.events.cloud.visionai_v1.types.MediaWarehouseConfig):
            Configs of media warehouse processor.

            This field is a member of `oneof`_ ``processor_config``.
        person_blur_config (google.events.cloud.visionai_v1.types.PersonBlurConfig):
            Configs of person blur processor.

            This field is a member of `oneof`_ ``processor_config``.
        occupancy_count_config (google.events.cloud.visionai_v1.types.OccupancyCountConfig):
            Configs of occupancy count processor.

            This field is a member of `oneof`_ ``processor_config``.
        person_vehicle_detection_config (google.events.cloud.visionai_v1.types.PersonVehicleDetectionConfig):
            Configs of Person Vehicle Detection
            processor.

            This field is a member of `oneof`_ ``processor_config``.
        vertex_automl_vision_config (google.events.cloud.visionai_v1.types.VertexAutoMLVisionConfig):
            Configs of Vertex AutoML vision processor.

            This field is a member of `oneof`_ ``processor_config``.
        vertex_automl_video_config (google.events.cloud.visionai_v1.types.VertexAutoMLVideoConfig):
            Configs of Vertex AutoML video processor.

            This field is a member of `oneof`_ ``processor_config``.
        vertex_custom_config (google.events.cloud.visionai_v1.types.VertexCustomConfig):
            Configs of Vertex Custom processor.

            This field is a member of `oneof`_ ``processor_config``.
        general_object_detection_config (google.events.cloud.visionai_v1.types.GeneralObjectDetectionConfig):
            Configs of General Object Detection
            processor.

            This field is a member of `oneof`_ ``processor_config``.
        big_query_config (google.events.cloud.visionai_v1.types.BigQueryConfig):
            Configs of BigQuery processor.

            This field is a member of `oneof`_ ``processor_config``.
        personal_protective_equipment_detection_config (google.events.cloud.visionai_v1.types.PersonalProtectiveEquipmentDetectionConfig):
            Configs of personal_protective_equipment_detection_config

            This field is a member of `oneof`_ ``processor_config``.
    """

    video_stream_input_config: 'VideoStreamInputConfig' = proto.Field(
        proto.MESSAGE,
        number=9,
        oneof='processor_config',
        message='VideoStreamInputConfig',
    )
    ai_enabled_devices_input_config: 'AIEnabledDevicesInputConfig' = proto.Field(
        proto.MESSAGE,
        number=20,
        oneof='processor_config',
        message='AIEnabledDevicesInputConfig',
    )
    media_warehouse_config: 'MediaWarehouseConfig' = proto.Field(
        proto.MESSAGE,
        number=10,
        oneof='processor_config',
        message='MediaWarehouseConfig',
    )
    person_blur_config: 'PersonBlurConfig' = proto.Field(
        proto.MESSAGE,
        number=11,
        oneof='processor_config',
        message='PersonBlurConfig',
    )
    occupancy_count_config: 'OccupancyCountConfig' = proto.Field(
        proto.MESSAGE,
        number=12,
        oneof='processor_config',
        message='OccupancyCountConfig',
    )
    person_vehicle_detection_config: 'PersonVehicleDetectionConfig' = proto.Field(
        proto.MESSAGE,
        number=15,
        oneof='processor_config',
        message='PersonVehicleDetectionConfig',
    )
    vertex_automl_vision_config: 'VertexAutoMLVisionConfig' = proto.Field(
        proto.MESSAGE,
        number=13,
        oneof='processor_config',
        message='VertexAutoMLVisionConfig',
    )
    vertex_automl_video_config: 'VertexAutoMLVideoConfig' = proto.Field(
        proto.MESSAGE,
        number=14,
        oneof='processor_config',
        message='VertexAutoMLVideoConfig',
    )
    vertex_custom_config: 'VertexCustomConfig' = proto.Field(
        proto.MESSAGE,
        number=17,
        oneof='processor_config',
        message='VertexCustomConfig',
    )
    general_object_detection_config: 'GeneralObjectDetectionConfig' = proto.Field(
        proto.MESSAGE,
        number=18,
        oneof='processor_config',
        message='GeneralObjectDetectionConfig',
    )
    big_query_config: 'BigQueryConfig' = proto.Field(
        proto.MESSAGE,
        number=19,
        oneof='processor_config',
        message='BigQueryConfig',
    )
    personal_protective_equipment_detection_config: 'PersonalProtectiveEquipmentDetectionConfig' = proto.Field(
        proto.MESSAGE,
        number=22,
        oneof='processor_config',
        message='PersonalProtectiveEquipmentDetectionConfig',
    )


class StreamWithAnnotation(proto.Message):
    r"""Message describing Vision AI stream with application specific
    annotations. All the StreamAnnotation object inside this message
    MUST have unique id.

    Attributes:
        stream (str):
            Vision AI Stream resource name.
        application_annotations (MutableSequence[google.events.cloud.visionai_v1.types.StreamAnnotation]):
            Annotations that will be applied to the whole
            application.
        node_annotations (MutableSequence[google.events.cloud.visionai_v1.types.StreamWithAnnotation.NodeAnnotation]):
            Annotations that will be applied to the
            specific node of the application. If the same
            type of the annotations is applied to both
            application and node, the node annotation will
            be added in addition to the global application
            one.
            For example, if there is one active zone
            annotation for the whole application and one
            active zone annotation for the Occupancy
            Analytic processor, then the Occupancy Analytic
            processor will have two active zones defined.
    """

    class NodeAnnotation(proto.Message):
        r"""Message describing annotations specific to application node.

        Attributes:
            node (str):
                The node name of the application graph.
            annotations (MutableSequence[google.events.cloud.visionai_v1.types.StreamAnnotation]):
                The node specific stream annotations.
        """

        node: str = proto.Field(
            proto.STRING,
            number=1,
        )
        annotations: MutableSequence['StreamAnnotation'] = proto.RepeatedField(
            proto.MESSAGE,
            number=2,
            message='StreamAnnotation',
        )

    stream: str = proto.Field(
        proto.STRING,
        number=1,
    )
    application_annotations: MutableSequence['StreamAnnotation'] = proto.RepeatedField(
        proto.MESSAGE,
        number=2,
        message='StreamAnnotation',
    )
    node_annotations: MutableSequence[NodeAnnotation] = proto.RepeatedField(
        proto.MESSAGE,
        number=3,
        message=NodeAnnotation,
    )


class VideoStreamInputConfig(proto.Message):
    r"""Message describing Video Stream Input Config.
    This message should only be used as a placeholder for
    builtin:stream-input processor, actual stream binding should be
    specified using corresponding API.

    Attributes:
        streams (MutableSequence[str]):

        streams_with_annotation (MutableSequence[google.events.cloud.visionai_v1.types.StreamWithAnnotation]):

    """

    streams: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=1,
    )
    streams_with_annotation: MutableSequence['StreamWithAnnotation'] = proto.RepeatedField(
        proto.MESSAGE,
        number=2,
        message='StreamWithAnnotation',
    )


class AIEnabledDevicesInputConfig(proto.Message):
    r"""Message describing AI-enabled Devices Input Config.
    """


class MediaWarehouseConfig(proto.Message):
    r"""Message describing MediaWarehouseConfig.

    Attributes:
        corpus (str):
            Resource name of the Media Warehouse corpus. Format:
            projects/${project_id}/locations/${location_id}/corpora/${corpus_id}
        region (str):
            Deprecated.
        ttl (google.protobuf.duration_pb2.Duration):
            The duration for which all media assets,
            associated metadata, and search documents can
            exist.
    """

    corpus: str = proto.Field(
        proto.STRING,
        number=1,
    )
    region: str = proto.Field(
        proto.STRING,
        number=2,
    )
    ttl: duration_pb2.Duration = proto.Field(
        proto.MESSAGE,
        number=3,
        message=duration_pb2.Duration,
    )


class PersonBlurConfig(proto.Message):
    r"""Message describing FaceBlurConfig.

    Attributes:
        person_blur_type (google.events.cloud.visionai_v1.types.PersonBlurConfig.PersonBlurType):
            Person blur type.
        faces_only (bool):
            Whether only blur faces other than the whole
            object in the processor.
    """
    class PersonBlurType(proto.Enum):
        r"""Type of Person Blur

        Values:
            PERSON_BLUR_TYPE_UNSPECIFIED (0):
                PersonBlur Type UNSPECIFIED.
            FULL_OCCULUSION (1):
                FaceBlur Type full occlusion.
            BLUR_FILTER (2):
                FaceBlur Type blur filter.
        """
        PERSON_BLUR_TYPE_UNSPECIFIED = 0
        FULL_OCCULUSION = 1
        BLUR_FILTER = 2

    person_blur_type: PersonBlurType = proto.Field(
        proto.ENUM,
        number=1,
        enum=PersonBlurType,
    )
    faces_only: bool = proto.Field(
        proto.BOOL,
        number=2,
    )


class OccupancyCountConfig(proto.Message):
    r"""Message describing OccupancyCountConfig.

    Attributes:
        enable_people_counting (bool):
            Whether to count the appearances of people,
            output counts have 'people' as the key.
        enable_vehicle_counting (bool):
            Whether to count the appearances of vehicles,
            output counts will have 'vehicle' as the key.
        enable_dwelling_time_tracking (bool):
            Whether to track each invidual object's
            loitering time inside the scene or specific
            zone.
    """

    enable_people_counting: bool = proto.Field(
        proto.BOOL,
        number=1,
    )
    enable_vehicle_counting: bool = proto.Field(
        proto.BOOL,
        number=2,
    )
    enable_dwelling_time_tracking: bool = proto.Field(
        proto.BOOL,
        number=3,
    )


class PersonVehicleDetectionConfig(proto.Message):
    r"""Message describing PersonVehicleDetectionConfig.

    Attributes:
        enable_people_counting (bool):
            At least one of enable_people_counting and
            enable_vehicle_counting fields must be set to true. Whether
            to count the appearances of people, output counts have
            'people' as the key.
        enable_vehicle_counting (bool):
            Whether to count the appearances of vehicles,
            output counts will have 'vehicle' as the key.
    """

    enable_people_counting: bool = proto.Field(
        proto.BOOL,
        number=1,
    )
    enable_vehicle_counting: bool = proto.Field(
        proto.BOOL,
        number=2,
    )


class PersonalProtectiveEquipmentDetectionConfig(proto.Message):
    r"""Message describing
    PersonalProtectiveEquipmentDetectionConfig.

    Attributes:
        enable_face_coverage_detection (bool):
            Whether to enable face coverage detection.
        enable_head_coverage_detection (bool):
            Whether to enable head coverage detection.
        enable_hands_coverage_detection (bool):
            Whether to enable hands coverage detection.
    """

    enable_face_coverage_detection: bool = proto.Field(
        proto.BOOL,
        number=1,
    )
    enable_head_coverage_detection: bool = proto.Field(
        proto.BOOL,
        number=2,
    )
    enable_hands_coverage_detection: bool = proto.Field(
        proto.BOOL,
        number=3,
    )


class GeneralObjectDetectionConfig(proto.Message):
    r"""Message of configurations for General Object Detection
    processor.

    """


class BigQueryConfig(proto.Message):
    r"""Message of configurations for BigQuery processor.

    Attributes:
        table (str):
            BigQuery table resource for Vision AI
            Platform to ingest annotations to.
        cloud_function_mapping (MutableMapping[str, str]):
            Data Schema By default, Vision AI Application will try to
            write annotations to the target BigQuery table using the
            following schema:

            ingestion_time: TIMESTAMP, the ingestion time of the
            original data.

            application: STRING, name of the application which produces
            the annotation.

            instance: STRING, Id of the instance which produces the
            annotation.

            node: STRING, name of the application graph node which
            produces the annotation.

            annotation: STRING or JSON, the actual annotation protobuf
            will be converted to json string with bytes field as 64
            encoded string. It can be written to both String or Json
            type column.

            To forward annotation data to an existing BigQuery table,
            customer needs to make sure the compatibility of the schema.
            The map maps application node name to its corresponding
            cloud function endpoint to transform the annotations
            directly to the
            google.cloud.bigquery.storage.v1.AppendRowsRequest (only
            avro_rows or proto_rows should be set). If configured,
            annotations produced by corresponding application node will
            sent to the Cloud Function at first before be forwarded to
            BigQuery.

            If the default table schema doesn't fit, customer is able to
            transform the annotation output from Vision AI Application
            to arbitrary BigQuery table schema with CloudFunction.

            -  The cloud function will receive
               AppPlatformCloudFunctionRequest where the annotations
               field will be the json format of Vision AI annotation.
            -  The cloud function should return
               AppPlatformCloudFunctionResponse with AppendRowsRequest
               stored in the annotations field.
            -  To drop the annotation, simply clear the annotations
               field in the returned AppPlatformCloudFunctionResponse.
        create_default_table_if_not_exists (bool):
            If true, App Platform will create the
            BigQuery DataSet and the BigQuery Table with
            default schema if the specified table doesn't
            exist. This doesn't work if any cloud function
            customized schema is specified since the system
            doesn't know your desired schema. JSON column
            will be used in the default table created by App
            Platform.
    """

    table: str = proto.Field(
        proto.STRING,
        number=1,
    )
    cloud_function_mapping: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=2,
    )
    create_default_table_if_not_exists: bool = proto.Field(
        proto.BOOL,
        number=3,
    )


class VertexAutoMLVisionConfig(proto.Message):
    r"""Message of configurations of Vertex AutoML Vision Processors.

    Attributes:
        confidence_threshold (float):
            Only entities with higher score than the
            threshold will be returned. Value 0.0 means to
            return all the detected entities.
        max_predictions (int):
            At most this many predictions will be
            returned per output frame. Value 0 means to
            return all the detected entities.
    """

    confidence_threshold: float = proto.Field(
        proto.FLOAT,
        number=1,
    )
    max_predictions: int = proto.Field(
        proto.INT32,
        number=2,
    )


class VertexAutoMLVideoConfig(proto.Message):
    r"""Message describing VertexAutoMLVideoConfig.

    Attributes:
        confidence_threshold (float):
            Only entities with higher score than the
            threshold will be returned. Value 0.0 means
            returns all the detected entities.
        blocked_labels (MutableSequence[str]):
            Labels specified in this field won't be
            returned.
        max_predictions (int):
            At most this many predictions will be
            returned per output frame. Value 0 means to
            return all the detected entities.
        bounding_box_size_limit (float):
            Only Bounding Box whose size is larger than
            this limit will be returned. Object Tracking
            only. Value 0.0 means to return all the detected
            entities.
    """

    confidence_threshold: float = proto.Field(
        proto.FLOAT,
        number=1,
    )
    blocked_labels: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=2,
    )
    max_predictions: int = proto.Field(
        proto.INT32,
        number=3,
    )
    bounding_box_size_limit: float = proto.Field(
        proto.FLOAT,
        number=4,
    )


class VertexCustomConfig(proto.Message):
    r"""Message describing VertexCustomConfig.

    Attributes:
        max_prediction_fps (int):
            The max prediction frame per second. This
            attribute sets how fast the operator sends
            prediction requests to Vertex AI endpoint.
            Default value is 0, which means there is no max
            prediction fps limit. The operator sends
            prediction requests at input fps.
        dedicated_resources (google.events.cloud.visionai_v1.types.DedicatedResources):
            A description of resources that are dedicated
            to the DeployedModel, and that need a higher
            degree of manual configuration.
        post_processing_cloud_function (str):
            If not empty, the prediction result will be sent to the
            specified cloud function for post processing.

            -  The cloud function will receive
               AppPlatformCloudFunctionRequest where the annotations
               field will be the json format of proto PredictResponse.
            -  The cloud function should return
               AppPlatformCloudFunctionResponse with PredictResponse
               stored in the annotations field.
            -  To drop the prediction output, simply clear the payload
               field in the returned AppPlatformCloudFunctionResponse.
        attach_application_metadata (bool):
            If true, the prediction request received by
            custom model will also contain metadata with the
            following schema:

            'appPlatformMetadata': {
                  'ingestionTime': DOUBLE; (UNIX timestamp)
            'application': STRING;
                  'instanceId': STRING;
                  'node': STRING;
                  'processor': STRING;
             }
    """

    max_prediction_fps: int = proto.Field(
        proto.INT32,
        number=1,
    )
    dedicated_resources: 'DedicatedResources' = proto.Field(
        proto.MESSAGE,
        number=2,
        message='DedicatedResources',
    )
    post_processing_cloud_function: str = proto.Field(
        proto.STRING,
        number=3,
    )
    attach_application_metadata: bool = proto.Field(
        proto.BOOL,
        number=4,
    )


class MachineSpec(proto.Message):
    r"""Specification of a single machine.

    Attributes:
        machine_type (str):
            Immutable. The type of the machine.

            See the `list of machine types supported for
            prediction <https://cloud.google.com/vertex-ai/docs/predictions/configure-compute#machine-types>`__

            See the `list of machine types supported for custom
            training <https://cloud.google.com/vertex-ai/docs/training/configure-compute#machine-types>`__.

            For [DeployedModel][] this field is optional, and the
            default value is ``n1-standard-2``. For
            [BatchPredictionJob][] or as part of [WorkerPoolSpec][] this
            field is required.
        accelerator_type (google.events.cloud.visionai_v1.types.AcceleratorType):
            Immutable. The type of accelerator(s) that may be attached
            to the machine as per
            [accelerator_count][google.cloud.visionai.v1.MachineSpec.accelerator_count].
        accelerator_count (int):
            The number of accelerators to attach to the
            machine.
    """

    machine_type: str = proto.Field(
        proto.STRING,
        number=1,
    )
    accelerator_type: 'AcceleratorType' = proto.Field(
        proto.ENUM,
        number=2,
        enum='AcceleratorType',
    )
    accelerator_count: int = proto.Field(
        proto.INT32,
        number=3,
    )


class AutoscalingMetricSpec(proto.Message):
    r"""The metric specification that defines the target resource
    utilization (CPU utilization, accelerator's duty cycle, and so
    on) for calculating the desired replica count.

    Attributes:
        metric_name (str):
            Required. The resource metric name. Supported metrics:

            -  For Online Prediction:
            -  ``aiplatform.googleapis.com/prediction/online/accelerator/duty_cycle``
            -  ``aiplatform.googleapis.com/prediction/online/cpu/utilization``
        target (int):
            The target resource utilization in percentage
            (1% - 100%) for the given metric; once the real
            usage deviates from the target by a certain
            percentage, the machine replicas change. The
            default value is 60 (representing 60%) if not
            provided.
    """

    metric_name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    target: int = proto.Field(
        proto.INT32,
        number=2,
    )


class DedicatedResources(proto.Message):
    r"""A description of resources that are dedicated to a
    DeployedModel, and that need a higher degree of manual
    configuration.

    Attributes:
        machine_spec (google.events.cloud.visionai_v1.types.MachineSpec):
            Required. Immutable. The specification of a
            single machine used by the prediction.
        min_replica_count (int):
            Required. Immutable. The minimum number of
            machine replicas this DeployedModel will be
            always deployed on. This value must be greater
            than or equal to 1.

            If traffic against the DeployedModel increases,
            it may dynamically be deployed onto more
            replicas, and as traffic decreases, some of
            these extra replicas may be freed.
        max_replica_count (int):
            Immutable. The maximum number of replicas this DeployedModel
            may be deployed on when the traffic against it increases. If
            the requested value is too large, the deployment will error,
            but if deployment succeeds then the ability to scale the
            model to that many replicas is guaranteed (barring service
            outages). If traffic against the DeployedModel increases
            beyond what its replicas at maximum may handle, a portion of
            the traffic will be dropped. If this value is not provided,
            will use
            [min_replica_count][google.cloud.visionai.v1.DedicatedResources.min_replica_count]
            as the default value.

            The value of this field impacts the charge against Vertex
            CPU and GPU quotas. Specifically, you will be charged for
            max_replica_count \* number of cores in the selected machine
            type) and (max_replica_count \* number of GPUs per replica
            in the selected machine type).
        autoscaling_metric_specs (MutableSequence[google.events.cloud.visionai_v1.types.AutoscalingMetricSpec]):
            Immutable. The metric specifications that overrides a
            resource utilization metric (CPU utilization, accelerator's
            duty cycle, and so on) target value (default to 60 if not
            set). At most one entry is allowed per metric.

            If
            [machine_spec.accelerator_count][google.cloud.visionai.v1.MachineSpec.accelerator_count]
            is above 0, the autoscaling will be based on both CPU
            utilization and accelerator's duty cycle metrics and scale
            up when either metrics exceeds its target value while scale
            down if both metrics are under their target value. The
            default target value is 60 for both metrics.

            If
            [machine_spec.accelerator_count][google.cloud.visionai.v1.MachineSpec.accelerator_count]
            is 0, the autoscaling will be based on CPU utilization
            metric only with default target value 60 if not explicitly
            set.

            For example, in the case of Online Prediction, if you want
            to override target CPU utilization to 80, you should set
            [autoscaling_metric_specs.metric_name][google.cloud.visionai.v1.AutoscalingMetricSpec.metric_name]
            to
            ``aiplatform.googleapis.com/prediction/online/cpu/utilization``
            and
            [autoscaling_metric_specs.target][google.cloud.visionai.v1.AutoscalingMetricSpec.target]
            to ``80``.
    """

    machine_spec: 'MachineSpec' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='MachineSpec',
    )
    min_replica_count: int = proto.Field(
        proto.INT32,
        number=2,
    )
    max_replica_count: int = proto.Field(
        proto.INT32,
        number=3,
    )
    autoscaling_metric_specs: MutableSequence['AutoscalingMetricSpec'] = proto.RepeatedField(
        proto.MESSAGE,
        number=4,
        message='AutoscalingMetricSpec',
    )


class Stream(proto.Message):
    r"""Message describing the Stream object. The Stream and the
    Event resources are many to many; i.e., each Stream resource can
    associate to many Event resources and each Event resource can
    associate to many Stream resources.

    Attributes:
        name (str):
            Name of the resource.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The create timestamp.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The update timestamp.
        labels (MutableMapping[str, str]):
            Labels as key value pairs.
        annotations (MutableMapping[str, str]):
            Annotations to allow clients to store small
            amounts of arbitrary data.
        display_name (str):
            The display name for the stream resource.
        enable_hls_playback (bool):
            Whether to enable the HLS playback service on
            this stream.
        media_warehouse_asset (str):
            The name of the media warehouse asset for long term storage
            of stream data. Format:
            projects/${p_id}/locations/${l_id}/corpora/${c_id}/assets/${a_id}
            Remain empty if the media warehouse storage is not needed
            for the stream.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    annotations: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=5,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=6,
    )
    enable_hls_playback: bool = proto.Field(
        proto.BOOL,
        number=7,
    )
    media_warehouse_asset: str = proto.Field(
        proto.STRING,
        number=8,
    )


class Event(proto.Message):
    r"""Message describing the Event object.

    Attributes:
        name (str):
            Name of the resource.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The create timestamp.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The update timestamp.
        labels (MutableMapping[str, str]):
            Labels as key value pairs.
        annotations (MutableMapping[str, str]):
            Annotations to allow clients to store small
            amounts of arbitrary data.
        alignment_clock (google.events.cloud.visionai_v1.types.Event.Clock):
            The clock used for joining streams.
        grace_period (google.protobuf.duration_pb2.Duration):
            Grace period for cleaning up the event. This is the time the
            controller waits for before deleting the event. During this
            period, if there is any active channel on the event. The
            deletion of the event after grace_period will be ignored.
    """
    class Clock(proto.Enum):
        r"""Clock that will be used for joining streams.

        Values:
            CLOCK_UNSPECIFIED (0):
                Clock is not specified.
            CAPTURE (1):
                Use the timestamp when the data is captured.
                Clients need to sync the clock.
            INGEST (2):
                Use the timestamp when the data is received.
        """
        CLOCK_UNSPECIFIED = 0
        CAPTURE = 1
        INGEST = 2

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    annotations: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=5,
    )
    alignment_clock: Clock = proto.Field(
        proto.ENUM,
        number=6,
        enum=Clock,
    )
    grace_period: duration_pb2.Duration = proto.Field(
        proto.MESSAGE,
        number=7,
        message=duration_pb2.Duration,
    )


class Series(proto.Message):
    r"""Message describing the Series object.

    Attributes:
        name (str):
            Name of the resource.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The create timestamp.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The update timestamp.
        labels (MutableMapping[str, str]):
            Labels as key value pairs.
        annotations (MutableMapping[str, str]):
            Annotations to allow clients to store small
            amounts of arbitrary data.
        stream (str):
            Required. Stream that is associated with this
            series.
        event (str):
            Required. Event that is associated with this
            series.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    annotations: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=5,
    )
    stream: str = proto.Field(
        proto.STRING,
        number=6,
    )
    event: str = proto.Field(
        proto.STRING,
        number=7,
    )


class SeriesEventData(proto.Message):
    r"""The data within all Series events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.visionai_v1.types.Series):
            Optional. The Series event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Series' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Series',
    )


class DraftEventData(proto.Message):
    r"""The data within all Draft events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.visionai_v1.types.Draft):
            Optional. The Draft event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Draft' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Draft',
    )


class ProcessorEventData(proto.Message):
    r"""The data within all Processor events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.visionai_v1.types.Processor):
            Optional. The Processor event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Processor' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Processor',
    )


class AnalysisEventData(proto.Message):
    r"""The data within all Analysis events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.visionai_v1.types.Analysis):
            Optional. The Analysis event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Analysis' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Analysis',
    )


class ClusterEventData(proto.Message):
    r"""The data within all Cluster events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.visionai_v1.types.Cluster):
            Optional. The Cluster event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Cluster' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Cluster',
    )


class EventEventData(proto.Message):
    r"""The data within all Event events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.visionai_v1.types.Event):
            Optional. The Event event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Event' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Event',
    )


class ProcessEventData(proto.Message):
    r"""The data within all Process events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.visionai_v1.types.Process):
            Optional. The Process event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Process' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Process',
    )


class StreamEventData(proto.Message):
    r"""The data within all Stream events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.visionai_v1.types.Stream):
            Optional. The Stream event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Stream' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Stream',
    )


class ApplicationEventData(proto.Message):
    r"""The data within all Application events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.visionai_v1.types.Application):
            Optional. The Application event payload.
            Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Application' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Application',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
