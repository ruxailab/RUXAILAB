# Copyright 2022 Google Inc.
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
"""
Module for options that can be used to configure Cloud Functions
deployments.
"""
# pylint: disable=protected-access
import enum as _enum
import dataclasses as _dataclasses
import re as _re
import typing as _typing
from zoneinfo import ZoneInfo as _ZoneInfo

import firebase_functions.private.manifest as _manifest
import firebase_functions.private.util as _util
import firebase_functions.private.path_pattern as _path_pattern
from firebase_functions.params import SecretParam, Expression

Timezone = _ZoneInfo
"""An alias of the zoneinfo.ZoneInfo for convenience."""

RESET_VALUE = _util.Sentinel(
    "Special configuration value to reset configuration to platform default.")
"""Special configuration value to reset configuration to platform default."""


class VpcEgressSetting(str, _enum.Enum):
    """Valid settings for VPC egress."""

    PRIVATE_RANGES_ONLY = "PRIVATE_RANGES_ONLY"
    ALL_TRAFFIC = "ALL_TRAFFIC"


class IngressSetting(str, _enum.Enum):
    """What kind of traffic can access the function."""

    ALLOW_ALL = "ALLOW_ALL"
    ALLOW_INTERNAL_ONLY = "ALLOW_INTERNAL_ONLY"
    ALLOW_INTERNAL_AND_GCLB = "ALLOW_INTERNAL_AND_GCLB"


@_dataclasses.dataclass(frozen=True)
class CorsOptions:
    """
    CORS options for HTTP functions.
    Internally this maps to Flask-Cors configuration. See:
    https://flask-cors.corydolphin.com/en/latest/configuration.html
    """

    cors_origins: str | list[str] | _re.Pattern | None = None
    """
    The origin(s) to allow requests from. An origin configured here that matches the value of
    the ``Origin`` header in a preflight ``OPTIONS`` request is returned as the value of the
    ``Access-Control-Allow-Origin`` response header.
    """

    cors_methods: str | list[str] | None = None
    """
    The method(s) which the allowed origins are allowed to access.
    These are included in the ``Access-Control-Allow-Methods`` response headers
    to the preflight ``OPTIONS`` requests.
    """


class MemoryOption(int, _enum.Enum):
    """
    Available memory options supported by Cloud Functions.
    """

    MB_128 = 128
    MB_256 = 256
    MB_512 = 512
    GB_1 = 1 << 10
    GB_2 = 2 << 10
    GB_4 = 4 << 10
    GB_8 = 8 << 10
    GB_16 = 16 << 10
    GB_32 = 32 << 10


class SupportedRegion(str, _enum.Enum):
    """
    All regions supported by Cloud Functions (2nd gen).
    """

    ASIA_NORTHEAST1 = "asia-northeast1"
    ASIA_EAST1 = "asia-east1"
    ASIA_NORTHEAST2 = "asia-northeast2"
    EUROPE_NORTH1 = "europe-north1"
    EUROPE_WEST1 = "europe-west1"
    EUROPE_WEST4 = "europe-west4"
    US_CENTRAL1 = "us-central1"
    US_EAST1 = "us-east1"
    US_EAST4 = "us-east4"
    US_WEST1 = "us-west1"
    ASIA_EAST2 = "asia-east2"
    ASIA_NORTHEAST3 = "asia-northeast3"
    ASIA_SOUTHEAST1 = "asia-southeast1"
    ASIA_SOUTHEAST2 = "asia-southeast2"
    ASIA_SOUTH1 = "asia-south1"
    AUSTRALIA_SOUTHEAST1 = "australia-southeast1"
    EUROPE_CENTRAL2 = "europe-central2"
    EUROPE_WEST2 = "europe-west2"
    EUROPE_WEST3 = "europe-west3"
    EUROPE_WEST6 = "europe-west6"
    NORTHAMERICA_NORTHEAST1 = "northamerica-northeast1"
    SOUTHAMERICA_EAST1 = "southamerica-east1"
    US_WEST2 = "us-west2"
    US_WEST3 = "us-west3"
    US_WEST4 = "us-west4"


@_dataclasses.dataclass(frozen=True)
class RateLimits():
    """
    How congestion control should be applied to the function.
    """
    max_concurrent_dispatches: int | Expression[
        int] | _util.Sentinel | None = None
    """
    The maximum number of requests that can be outstanding at a time.
    If left unspecified, defaults to 1000.
    """

    max_dispatches_per_second: int | Expression[
        int] | _util.Sentinel | None = None
    """
    The maximum number of requests that can be invoked per second.
    If left unspecified, defaults to 500.
    """


@_dataclasses.dataclass(frozen=True)
class RetryConfig():
    """
    How a task should be retried in the event of a non-2xx return.
    """

    max_attempts: int | Expression[int] | _util.Sentinel | None = None
    """
    The maximum number of times a request should be attempted.
    If left unspecified, defaults to 3.
    """

    max_retry_seconds: int | Expression[int] | _util.Sentinel | None = None
    """
    The maximum amount of time for retrying a failed task.
    If left unspecified will retry indefinitely.
    """

    max_backoff_seconds: int | Expression[int] | _util.Sentinel | None = None
    """
    The maximum amount of time to wait between attempts.
    If left unspecified defaults to 1hr.
    """

    max_doublings: int | Expression[int] | _util.Sentinel | None = None
    """
    The maximum number of times to double the backoff between
    retries. If left unspecified defaults to 16.
    """

    min_backoff_seconds: int | Expression[int] | _util.Sentinel | None = None
    """
    The minimum time to wait between attempts.
    """


@_dataclasses.dataclass(frozen=True, kw_only=True)
class RuntimeOptions:
    """
    ``RuntimeOptions`` are options that can be set on any function or globally.
    Internal use only.
    """

    region: SupportedRegion | str | list[SupportedRegion | str] | None = None
    """
    Region where functions should be deployed.
    HTTP functions can specify more than one region.
    """

    memory: int | MemoryOption | Expression[int] | _util.Sentinel | None = None
    """
    Amount of memory to allocate to a function.
    A value of ``RESET_VALUE`` restores the defaults of 256MB.
    """

    timeout_sec: int | Expression[int] | _util.Sentinel | None = None
    """
    Timeout for the function in sections. Possible values are 0 to 540.
    HTTP functions can specify a higher timeout.
    A value of ``RESET_VALUE`` restores the default of 60s
    The minimum timeout for a 2nd gen function is 1s. The maximum timeout for a
    function depends on the type of function: Event handling functions have a
    maximum timeout of 540s (9 minutes). HTTP and callable functions have a
    maximum timeout of 3,600s (1 hour). Task queue functions have a maximum
    timeout of 1,800s (30 minutes)
    """

    min_instances: int | Expression[int] | _util.Sentinel | None = None
    """
    Minimum number of actual instances to be running at a given time.
    Instances are billed for memory allocation and 10% of CPU allocation
    while idle.
    A value of ``RESET_VALUE`` restores the default minimum instances.
    """

    max_instances: int | Expression[int] | _util.Sentinel | None = None
    """
    Maximum number of instances to be running in parallel.
    A value of ``RESET_VALUE`` restores the default max instances.
    """

    concurrency: int | Expression[int] | _util.Sentinel | None = None
    """
    Number of requests a function can serve at once.
    Can be applied only to functions running on Cloud Functions (2nd gen).
    A value of ``RESET_VALUE`` restores the default concurrency (80 when CPU >= 1, 1 otherwise).
    Concurrency cannot be set to any value other than 1 if `cpu` is less than 1.
    The maximum value for concurrency is 1,000.
    """

    cpu: int | _typing.Literal["gcf_gen1"] | _util.Sentinel | None = None
    """
    Fractional number of CPUs to allocate to a function.
    Defaults to 1 for functions with <= 2GB RAM and increases for larger memory sizes.
    This is different from the defaults when using the gcloud utility and is different from
    the fixed amount assigned in Cloud Functions (1st gen).
    To revert to the CPU amounts used in gcloud or in Cloud Functions (1st gen), set this
    to the value "gcf_gen1"
    """

    vpc_connector: str | _util.Sentinel | None = None
    """
    Connect function to specified VPC connector.
    A value of ``RESET_VALUE`` removes the VPC connector.
    """

    vpc_connector_egress_settings: VpcEgressSetting | _util.Sentinel | None = None
    """
    Egress settings for VPC connector.
    A value of ``RESET_VALUE`` turns off VPC connector egress settings.
    """

    service_account: str | _util.Sentinel | None = None
    """
    Specific service account for the function to run as.
    A value of ``RESET_VALUE`` restores the default service account.
    """

    ingress: IngressSetting | _util.Sentinel | None = None
    """
    Ingress settings which control where this function can be called from.
    A value of ``RESET_VALUE`` turns off ingress settings.
    """

    labels: dict[str, str] | None = None
    """
    User labels to set on the function.
    """

    secrets: list[str] | list[SecretParam] | _util.Sentinel | None = None
    """
    Secrets to bind to a function.
    """

    enforce_app_check: bool | None = None
    """
    Determines whether Firebase AppCheck is enforced.
    When true, requests with invalid tokens auto respond with a 401
    Unauthorized response.
    When false, requests with invalid tokens set ``event.app`` to ``None``.
    """

    preserve_external_changes: bool | None = None
    """
    Controls whether function configuration modified outside of function source is preserved.
    Internally defaults to false.

    When setting configuration available in the underlying platform that is not yet available
    in the Cloud Functions SDK, we highly recommend setting `preserve_external_changes` to
    `True`. Otherwise, when the SDK releases a new version
    with support for the missing configuration, your function's manually configured setting
    may inadvertently be wiped out.
    """

    def _asdict_with_global_options(self) -> dict:
        """
        Returns the provider options merged with globally defined options.
        """
        # We don't use dataclasses.asdict with a custom dict factory since
        # it internally converts dataclasses to dicts automatically but
        # we don't want that since we want to represent certain dataclasses
        # (such as params) differently (not as a dict) when converting to
        # a manifest representation.
        provider_options = _manifest._dict_to_spec(self.__dict__)
        global_options = _manifest._dict_to_spec(_GLOBAL_OPTIONS.__dict__)
        merged_options: dict = {**global_options, **provider_options}

        if self.labels is not None and _GLOBAL_OPTIONS.labels is not None:
            merged_options["labels"] = {**_GLOBAL_OPTIONS.labels, **self.labels}
        if "labels" not in merged_options:
            merged_options["labels"] = {}
        preserve_external_changes: bool = merged_options.get(
            "preserve_external_changes",
            False,
        )
        resettable_options = [
            "memory",
            "timeout_sec",
            "min_instances",
            "max_instances",
            "ingress",
            "concurrency",
            "service_account",
            "vpc_connector",
            "vpc_connector_egress_settings",
        ]
        if not preserve_external_changes:
            for option in resettable_options:
                if option not in merged_options:
                    merged_options[option] = RESET_VALUE

        if self.secrets and not self.secrets == _util.Sentinel:

            def convert_secret(secret) -> str:
                secret_value = secret
                if isinstance(secret, SecretParam):
                    secret_value = secret.name
                return secret_value

            merged_options["secrets"] = list(
                map(convert_secret, _typing.cast(list, self.secrets)))
        # _util.Sentinel values are converted to `None` in ManifestEndpoint generation
        # after other None values are removed - so as to keep them in the generated
        # YAML output as 'null' values.
        return merged_options

    def _endpoint(self, **kwargs) -> _manifest.ManifestEndpoint:
        assert kwargs["func_name"] is not None
        options_dict = self._asdict_with_global_options()
        options = self.__class__(**options_dict)
        secret_envs: list[
            _manifest.SecretEnvironmentVariable] | _util.Sentinel = []
        if options.secrets is not None:
            if isinstance(options.secrets, list):

                def convert_secret(
                        secret) -> _manifest.SecretEnvironmentVariable:
                    return {"key": secret}

                secret_envs = list(
                    map(convert_secret, _typing.cast(list, options.secrets)))
            elif options.secrets is _util.Sentinel:
                secret_envs = _typing.cast(_util.Sentinel, options.secrets)

        region: list[str] | None = None
        if isinstance(options.region, list):
            region = _typing.cast(list, options.region)
        elif options.region is not None:
            region = [_typing.cast(str, options.region)]

        vpc: _manifest.VpcSettings | None = None
        if isinstance(options.vpc_connector, str):
            vpc = ({
                "connector":
                    options.vpc_connector,
                "egressSettings":
                    options.vpc_connector_egress_settings.value if isinstance(
                        options.vpc_connector_egress_settings, VpcEgressSetting)
                    else options.vpc_connector_egress_settings
            } if options.vpc_connector_egress_settings is not None else {
                "connector": options.vpc_connector
            })

        endpoint = _manifest.ManifestEndpoint(
            entryPoint=kwargs["func_name"],
            region=region,
            availableMemoryMb=options.memory,
            labels=options.labels,
            maxInstances=options.max_instances,
            minInstances=options.min_instances,
            concurrency=options.concurrency,
            serviceAccountEmail=options.service_account,
            timeoutSeconds=options.timeout_sec,
            cpu=options.cpu,
            ingressSettings=options.ingress,
            secretEnvironmentVariables=secret_envs,
            vpc=vpc,
        )

        return endpoint


@_dataclasses.dataclass(frozen=True, kw_only=True)
class TaskQueueOptions(RuntimeOptions):
    """
    Options specific to tasks function types.
    """

    retry_config: RetryConfig | None = None
    """
    How a task should be retried in the event of a non-2xx return.
    """

    rate_limits: RateLimits | None = None
    """
    How congestion control should be applied to the function.
    """

    invoker: str | list[str] | _typing.Literal["private"] | None = None
    """
    Who can enqueue tasks for this function.

    Note:
        If left unspecified, only service accounts which have
        `roles/cloudtasks.enqueuer` and `roles/cloudfunctions.invoker`
        will have permissions.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        rate_limits: _manifest.RateLimits | None = _manifest.RateLimits(
            maxConcurrentDispatches=self.rate_limits.max_concurrent_dispatches,
            maxDispatchesPerSecond=self.rate_limits.max_dispatches_per_second,
        ) if self.rate_limits is not None else None

        retry_config: _manifest.RetryConfigTasks | None = _manifest.RetryConfigTasks(
            maxAttempts=self.retry_config.max_attempts,
            maxRetrySeconds=self.retry_config.max_retry_seconds,
            maxBackoffSeconds=self.retry_config.max_backoff_seconds,
            maxDoublings=self.retry_config.max_doublings,
            minBackoffSeconds=self.retry_config.min_backoff_seconds,
        ) if self.retry_config is not None else None

        kwargs_merged = {
            **_dataclasses.asdict(super()._endpoint(**kwargs)),
            "taskQueueTrigger":
                _manifest.TaskQueueTrigger(
                    rateLimits=rate_limits,
                    retryConfig=retry_config,
                ),
        }
        return _manifest.ManifestEndpoint(
            **_typing.cast(_typing.Dict, kwargs_merged))

    def _required_apis(self) -> list[_manifest.ManifestRequiredApi]:
        return [
            _manifest.ManifestRequiredApi(
                api="cloudtasks.googleapis.com",
                reason="Needed for task queue functions",
            )
        ]


# TODO refactor Storage & Database options to use this base class.
@_dataclasses.dataclass(frozen=True, kw_only=True)
class EventHandlerOptions(RuntimeOptions):
    """
    Options specific to any event handling function.
    Internal use only.
    """

    retry: bool | Expression[bool] | _util.Sentinel | None = None
    """
    Whether failed executions should be delivered again.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        assert kwargs["event_filters"] is not None
        assert kwargs["event_type"] is not None

        event_trigger = _manifest.EventTrigger(
            eventType=kwargs["event_type"],
            retry=self.retry if self.retry is not None else False,
            eventFilters=kwargs["event_filters"],
        )

        kwargs_merged = {
            **_dataclasses.asdict(super()._endpoint(**kwargs)),
            "eventTrigger":
                event_trigger,
        }
        return _manifest.ManifestEndpoint(
            **_typing.cast(_typing.Dict, kwargs_merged))


@_dataclasses.dataclass(frozen=True, kw_only=True)
class PubSubOptions(EventHandlerOptions):
    """
    Options specific to Pub/Sub function types.
    Internal use only.
    """

    topic: str
    """
    The Pub/Sub topic to watch for message events.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        event_filters: _typing.Any = {
            "topic": self.topic,
        }
        event_type = "google.cloud.pubsub.topic.v1.messagePublished"
        return _manifest.ManifestEndpoint(**_typing.cast(
            _typing.Dict,
            _dataclasses.asdict(super()._endpoint(
                **kwargs, event_filters=event_filters, event_type=event_type))))


class AlertType(str, _enum.Enum):
    """
    The underlying alert type of the Firebase alerts provider.
    """

    CRASHLYTICS_NEW_FATAL_ISSUE = "crashlytics.newFatalIssue"
    """
    Crashlytics new fatal issue alerts.
    """

    CRASHLYTICS_NEW_NONFATAL_ISSUE = "crashlytics.newNonfatalIssue"
    """
    Crashlytics new non-fatal issue alerts.
    """

    CRASHLYTICS_REGRESSION = "crashlytics.regression"
    """
    Crashlytics regression alerts.
    """

    CRASHLYTICS_STABILITY_DIGEST = "crashlytics.stabilityDigest"
    """
    Crashlytics stability digest alerts.
    """

    CRASHLYTICS_VELOCITY = "crashlytics.velocity"
    """
    Crashlytics velocity alerts.
    """

    CRASHLYTICS_NEW_ANR_ISSUE = "crashlytics.newAnrIssue"
    """
    Crashlytics new ANR issue alerts.
    """

    BILLING_PLAN_UPDATE = "billing.planUpdate"
    """
    Billing plan update alerts.
    """

    BILLING_PLAN_AUTOMATED_UPDATE = "billing.planAutomatedUpdate"
    """
    Billing automated plan update alerts.
    """

    APP_DISTRIBUTION_NEW_TESTER_IOS_DEVICE = "appDistribution.newTesterIosDevice"
    """
    App Distribution new tester iOS device alerts.
    """

    APP_DISTRIBUTION_IN_APP_FEEDBACK = "appDistribution.inAppFeedback"
    """
    App Distribution in-app feedback alerts.
    """

    PERFORMANCE_THRESHOLD = "performance.threshold"
    """
    Performance threshold alerts.
    """


@_dataclasses.dataclass(frozen=True, kw_only=True)
class FirebaseAlertOptions(EventHandlerOptions):
    """
    Options specific to Firebase alert function types.
    Internal use only.
    """

    alert_type: str | AlertType
    """
    The Firebase alert type to listen to. Can be an ``AlertType`` enum
    or string.
    """

    app_id: str | None = None
    """
    An optional app ID to scope down alerts.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        event_filters: _typing.Any = {
            "alerttype": self.alert_type,
        }

        if self.app_id is not None:
            event_filters["appid"] = self.app_id

        event_type = "google.firebase.firebasealerts.alerts.v1.published"
        return _manifest.ManifestEndpoint(**_typing.cast(
            _typing.Dict,
            _dataclasses.asdict(super()._endpoint(
                **kwargs,
                event_filters=event_filters,
                event_type=event_type,
            ))))


@_dataclasses.dataclass(frozen=True, kw_only=True)
class AppDistributionOptions(EventHandlerOptions):
    """
    Options specific to app distribution functions.
    Internal use only.
    """

    app_id: str | None = None
    """
    An optional app ID to scope down alerts.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        assert kwargs["alert_type"] is not None
        return FirebaseAlertOptions(
            alert_type=kwargs["alert_type"],
            app_id=self.app_id,
        )._endpoint(**kwargs)


@_dataclasses.dataclass(frozen=True, kw_only=True)
class PerformanceOptions(EventHandlerOptions):
    """
    Options specific to performance alerts functions.
    Internal use only.
    """

    app_id: str | None = None
    """
    An optional app ID to scope down alerts.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        assert kwargs["alert_type"] is not None
        return FirebaseAlertOptions(
            alert_type=kwargs["alert_type"],
            app_id=self.app_id,
        )._endpoint(**kwargs)


@_dataclasses.dataclass(frozen=True, kw_only=True)
class CrashlyticsOptions(EventHandlerOptions):
    """
    Options specific to Crashlytics alert functions.
    Internal use only.
    """

    app_id: str | None = None
    """
    An optional app ID to scope down alerts.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        assert kwargs["alert_type"] is not None
        return FirebaseAlertOptions(
            alert_type=kwargs["alert_type"],
            app_id=self.app_id,
        )._endpoint(**kwargs)


@_dataclasses.dataclass(frozen=True, kw_only=True)
class BillingOptions(EventHandlerOptions):
    """
    Options specific to billing alert functions.
    Internal use only.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        assert kwargs["alert_type"] is not None
        return FirebaseAlertOptions(
            alert_type=kwargs["alert_type"],)._endpoint(**kwargs)


@_dataclasses.dataclass(frozen=True, kw_only=True)
class EventarcTriggerOptions(EventHandlerOptions):
    """
    Options that can be set on an Eventarc trigger.
    Internal use only.
    """

    event_type: str
    """
    Type of the event to trigger on.
    """

    channel: str | None = None
    """
    ID of the channel. Can be either:
      * fully qualified channel resource name:
        `projects/{project}/locations/{location}/channels/{channel-id}`
      * partial resource name with location and channel ID, in which case
        the runtime project ID of the function will be used:
        `locations/{location}/channels/{channel-id}`
      * partial channel ID, in which case the runtime project ID of the
        function and `us-central1` as location will be used:
        `{channel-id}`

    If not specified, the default Firebase channel is used:
    `projects/{project}/locations/us-central1/channels/firebase`
    """

    filters: dict[str, str] | None = None
    """
    Eventarc event exact match filter.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        event_filters = {} if self.filters is None else self.filters
        endpoint = _manifest.ManifestEndpoint(**_typing.cast(
            _typing.Dict,
            _dataclasses.asdict(super()._endpoint(
                **kwargs,
                event_filters=event_filters,
                event_type=self.event_type,
            ))))
        assert endpoint.eventTrigger is not None
        channel = (self.channel if self.channel is not None else
                   "locations/us-central1/channels/firebase")
        endpoint.eventTrigger["channel"] = channel
        return endpoint

    def _required_apis(self) -> list[_manifest.ManifestRequiredApi]:
        return [
            _manifest.ManifestRequiredApi(
                api="eventarcpublishing.googleapis.com",
                reason="Needed for custom event functions",
            )
        ]


@_dataclasses.dataclass(frozen=True, kw_only=True)
class ScheduleOptions(RuntimeOptions):
    """
    Options that can be set on a ``Schedule`` trigger.
    """

    schedule: str
    """
    The schedule, in Unix Crontab or AppEngine syntax.
    """

    timezone: Timezone | Expression[str] | _util.Sentinel | None = None
    """
    The timezone that the schedule executes in.
    """

    retry_count: int | Expression[int] | _util.Sentinel | None = None
    """
    The number of retry attempts for a failed run.
    """

    max_retry_seconds: int | Expression[int] | _util.Sentinel | None = None
    """
    The time limit for retrying.
    """

    max_backoff_seconds: int | Expression[int] | _util.Sentinel | None = None
    """
    The maximum amount of time to wait between attempts.
    """

    max_doublings: int | Expression[int] | _util.Sentinel | None = None
    """
    The maximum number of times to double the backoff between
    retries.
    """

    min_backoff_seconds: int | Expression[int] | _util.Sentinel | None = None
    """
    The minimum time to wait between attempts.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        retry_config: _manifest.RetryConfigScheduler = _manifest.RetryConfigScheduler(
            retryCount=self.retry_count,
            maxRetrySeconds=self.max_retry_seconds,
            maxBackoffSeconds=self.max_backoff_seconds,
            maxDoublings=self.max_doublings,
            minBackoffSeconds=self.min_backoff_seconds,
        )
        time_zone: str | Expression[str] | _util.Sentinel | None = None
        if isinstance(self.timezone, Timezone):
            time_zone = self.timezone.key
        else:
            time_zone = self.timezone

        kwargs_merged = {
            **_dataclasses.asdict(super()._endpoint(**kwargs)),
            "scheduleTrigger":
                _manifest.ScheduleTrigger(
                    schedule=self.schedule,
                    timeZone=time_zone,
                    retryConfig=retry_config,
                ),
        }
        return _manifest.ManifestEndpoint(
            **_typing.cast(_typing.Dict, kwargs_merged))

    def _required_apis(self) -> list[_manifest.ManifestRequiredApi]:
        return [
            _manifest.ManifestRequiredApi(
                api="cloudscheduler.googleapis.com",
                reason="Needed for scheduled functions.",
            )
        ]


@_dataclasses.dataclass(frozen=True, kw_only=True)
class StorageOptions(RuntimeOptions):
    """
    Options specific to Cloud Storage function types.
    Internal use only.
    """

    bucket: str | Expression[str] | None = None
    """
    The name of the bucket to watch for Storage events.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        assert kwargs["event_type"] is not None
        bucket = self.bucket
        if bucket is None:
            firebase_config = _util.firebase_config()
            if firebase_config is not None:
                bucket = firebase_config.storage_bucket
        if bucket is None:
            raise ValueError(
                "Missing bucket name. If you are unit testing, please specify a bucket name"
                " by providing a bucket name directly to the event handler or by setting the"
                " FIREBASE_CONFIG environment variable.")
        event_filters: _typing.Any = {
            "bucket": bucket,
        }
        event_trigger = _manifest.EventTrigger(
            eventType=kwargs["event_type"],
            retry=False,
            eventFilters=event_filters,
        )

        kwargs_merged = {
            **_dataclasses.asdict(super()._endpoint(**kwargs)),
            "eventTrigger":
                event_trigger,
        }
        return _manifest.ManifestEndpoint(
            **_typing.cast(_typing.Dict, kwargs_merged))


@_dataclasses.dataclass(frozen=True, kw_only=True)
class DatabaseOptions(RuntimeOptions):
    """
    Options specific to Realtime Database function types.
    Internal use only.
    """

    reference: str
    """
    Specify the handler to trigger on a database reference(s).
    This value can either be a single reference or a pattern.
    Examples: '/foo/bar', '/foo/{bar}'
    """

    instance: str | None = None
    """
    Specify the handler to trigger on a database instance(s).
    If present, this value can either be a single instance or a pattern.
    Examples: 'my-instance-1', 'my-instance-\\*'
    Note: The capture syntax cannot be used for 'instance'.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        assert kwargs["event_type"] is not None
        assert kwargs["instance_pattern"] is not None
        instance_pattern: _path_pattern.PathPattern = kwargs["instance_pattern"]
        event_filter_instance = instance_pattern.value
        event_filters: _typing.Any = {}
        event_filters_path_patterns: _typing.Any = {
            # Note: Eventarc always treats ref as a path pattern
            "ref": self.reference.strip("/"),
        }
        if instance_pattern.has_wildcards:
            event_filters_path_patterns["instance"] = event_filter_instance
        else:
            event_filters["instance"] = event_filter_instance

        event_trigger = _manifest.EventTrigger(
            eventType=kwargs["event_type"],
            retry=False,
            eventFilters=event_filters,
            eventFilterPathPatterns=event_filters_path_patterns,
        )

        kwargs_merged = {
            **_dataclasses.asdict(super()._endpoint(**kwargs)),
            "eventTrigger":
                event_trigger,
        }
        return _manifest.ManifestEndpoint(
            **_typing.cast(_typing.Dict, kwargs_merged))


@_dataclasses.dataclass(frozen=True, kw_only=True)
class BlockingOptions(RuntimeOptions):
    """
    Options that can be set on an Auth Blocking trigger.
    Internal use only.
    """

    id_token: bool | None = None
    """
    Pass the ID Token credential to the function.
    """

    access_token: bool | None = None
    """
    Pass the access token credential to the function.
    """

    refresh_token: bool | None = None
    """
    Pass the refresh token credential to the function.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        assert kwargs["event_type"] is not None

        blocking_trigger = _manifest.BlockingTrigger(
            eventType=kwargs["event_type"],
            options=_manifest.BlockingTriggerOptions(
                idToken=self.id_token if self.id_token is not None else False,
                accessToken=self.access_token
                if self.access_token is not None else False,
                refreshToken=self.refresh_token
                if self.refresh_token is not None else False,
            ),
        )

        kwargs_merged = {
            **_dataclasses.asdict(super()._endpoint(**kwargs)),
            "blockingTrigger":
                blocking_trigger,
        }
        return _manifest.ManifestEndpoint(
            **_typing.cast(_typing.Dict, kwargs_merged))

    def _required_apis(self) -> list[_manifest.ManifestRequiredApi]:
        return [
            _manifest.ManifestRequiredApi(
                api="identitytoolkit.googleapis.com",
                reason="Needed for auth blocking functions",
            )
        ]


@_dataclasses.dataclass(frozen=True, kw_only=True)
class FirestoreOptions(RuntimeOptions):
    """
    Options specific to Firestore function types.
    Internal use only.
    """

    document: str
    """
    The document path to watch for Firestore events.
    This value can either be a document path or a pattern.
    Examples: 'foo/bar', 'foo/{bar}'
    """

    database: str | None = None
    """
    The Firestore database.
    """

    namespace: str | None = None
    """
    The Firestore namespace.
    """

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        assert kwargs["event_type"] is not None
        assert kwargs["document_pattern"] is not None
        document_pattern: _path_pattern.PathPattern = kwargs["document_pattern"]
        event_filter_document = document_pattern.value
        event_filters: _typing.Any = {
            "database":
                self.database if self.database is not None else "(default)",
            "namespace":
                self.namespace if self.namespace is not None else "(default)",
        }
        event_filters_path_patterns: _typing.Any = {}
        if document_pattern.has_wildcards:
            event_filters_path_patterns["document"] = event_filter_document
        else:
            event_filters["document"] = event_filter_document
        event_trigger = _manifest.EventTrigger(
            eventType=kwargs["event_type"],
            retry=False,
            eventFilters=event_filters,
            eventFilterPathPatterns=event_filters_path_patterns,
        )

        kwargs_merged = {
            **_dataclasses.asdict(super()._endpoint(**kwargs)),
            "eventTrigger":
                event_trigger,
        }
        return _manifest.ManifestEndpoint(
            **_typing.cast(_typing.Dict, kwargs_merged))


@_dataclasses.dataclass(frozen=True, kw_only=True)
class HttpsOptions(RuntimeOptions):
    """
    Options specific to HTTP function types.
    Internal use only.
    """

    invoker: str | list[str] | _typing.Literal["public",
                                               "private"] | None = None
    """
    Invoker to set access control on HTTP functions.
    """

    cors: CorsOptions | None = None
    """
    Optionally set CORS options for HTTP functions.
    """

    def _asdict_with_global_options(self) -> dict:
        """
        Returns the HTTP options merged with globally defined options and
        client-only options like "cors" removed.
        """
        merged_options = super()._asdict_with_global_options()
        # "cors" is only used locally by the functions framework
        # and is not used in the manifest or in global options.
        if "cors" in merged_options:
            del merged_options["cors"]
        return merged_options

    def _endpoint(
        self,
        **kwargs,
    ) -> _manifest.ManifestEndpoint:
        kwargs_merged: dict[str, _typing.Any] = {
            **_dataclasses.asdict(super()._endpoint(**kwargs)),
        }

        if "callable" in kwargs and kwargs["callable"] is True:
            labels = _typing.cast(dict[str, str], kwargs_merged["labels"])
            labels["deployment-callable"] = "true"
            kwargs_merged["labels"] = labels
            kwargs_merged["callableTrigger"] = _manifest.CallableTrigger()
        else:
            https_trigger = _manifest.HttpsTrigger()
            if self.invoker is not None:
                invoker = self.invoker
                if isinstance(invoker, str):
                    invoker = [invoker]
                assert len(
                    invoker
                ) > 1, "HttpsOptions: Invalid option for invoker - must be a non-empty list."
                assert "" not in invoker, (
                    "HttpsOptions: Invalid option for invoker - must be a non-empty string."
                )
                if len(invoker) > 1:
                    assert "private" not in invoker and "public" not in invoker, (
                        # pylint: disable=line-too-long
                        "HttpsOptions: Cannot have 'public' or 'private' in a list of service accounts."
                    )
                https_trigger["invoker"] = invoker
            kwargs_merged["httpsTrigger"] = https_trigger

        return _manifest.ManifestEndpoint(
            **_typing.cast(_typing.Dict, kwargs_merged))


_GLOBAL_OPTIONS = RuntimeOptions()
"""The current default options for all functions. Internal use only."""


def set_global_options(
    *,
    region: SupportedRegion | str | list[SupportedRegion | str] | None = None,
    memory: int | MemoryOption | Expression[int] | _util.Sentinel | None = None,
    timeout_sec: int | Expression[int] | _util.Sentinel | None = None,
    min_instances: int | Expression[int] | _util.Sentinel | None = None,
    max_instances: int | Expression[int] | _util.Sentinel | None = None,
    concurrency: int | Expression[int] | _util.Sentinel | None = None,
    cpu: int | _typing.Literal["gcf_gen1"] | _util.Sentinel = "gcf_gen1",
    vpc_connector: str | None = None,
    vpc_connector_egress_settings: VpcEgressSetting | None = None,
    service_account: str | _util.Sentinel | None = None,
    ingress: IngressSetting | _util.Sentinel | None = None,
    labels: dict[str, str] | None = None,
    secrets: list[str] | list[SecretParam] | _util.Sentinel | None = None,
    enforce_app_check: bool | None = None,
    preserve_external_changes: bool | None = None,
):
    """
    Sets default options for all functions.
    """
    global _GLOBAL_OPTIONS
    _GLOBAL_OPTIONS = RuntimeOptions(
        region=region,
        memory=memory,
        timeout_sec=timeout_sec,
        min_instances=min_instances,
        max_instances=max_instances,
        concurrency=concurrency,
        cpu=cpu,
        vpc_connector=vpc_connector,
        vpc_connector_egress_settings=vpc_connector_egress_settings,
        service_account=service_account,
        ingress=ingress,
        labels=labels,
        secrets=secrets,
        enforce_app_check=enforce_app_check,
        preserve_external_changes=preserve_external_changes,
    )
