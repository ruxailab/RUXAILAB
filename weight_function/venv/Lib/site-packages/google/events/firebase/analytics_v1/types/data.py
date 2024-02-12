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


__protobuf__ = proto.module(
    package='google.events.firebase.analytics.v1',
    manifest={
        'AnalyticsLogData',
        'UserDimensions',
        'UserPropertyValue',
        'AnalyticsValue',
        'DeviceInfo',
        'AppInfo',
        'GeoInfo',
        'TrafficSource',
        'ExportBundleInfo',
        'LtvInfo',
        'EventDimensions',
    },
)


class AnalyticsLogData(proto.Message):
    r"""The data within Firebase Analytics log events.

    Attributes:
        user_dim (google.events.firebase.analytics_v1.types.UserDimensions):
            User related dimensions.
        event_dim (MutableSequence[google.events.firebase.analytics_v1.types.EventDimensions]):
            A repeated record of event related
            dimensions.
    """

    user_dim: 'UserDimensions' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='UserDimensions',
    )
    event_dim: MutableSequence['EventDimensions'] = proto.RepeatedField(
        proto.MESSAGE,
        number=2,
        message='EventDimensions',
    )


class UserDimensions(proto.Message):
    r"""Message containing information about the user associated with
    the event.

    Attributes:
        user_id (str):
            The user ID set via the setUserId API.
        first_open_timestamp_micros (int):
            The time (in microseconds) at which the user
            first opened the app.
        user_properties (MutableMapping[str, google.events.firebase.analytics_v1.types.UserPropertyValue]):
            A repeated record of user properties set with
            the setUserProperty API.
            https://firebase.google.com/docs/analytics/android/properties
        device_info (google.events.firebase.analytics_v1.types.DeviceInfo):
            Device information.
        geo_info (google.events.firebase.analytics_v1.types.GeoInfo):
            User's geographic information.
        app_info (google.events.firebase.analytics_v1.types.AppInfo):
            App information.
        traffic_source (google.events.firebase.analytics_v1.types.TrafficSource):
            Information about marketing campaign which
            acquired the user.
        bundle_info (google.events.firebase.analytics_v1.types.ExportBundleInfo):
            Information regarding the bundle in which
            these events were uploaded.
        ltv_info (google.events.firebase.analytics_v1.types.LtvInfo):
            Lifetime Value information about this user.
    """

    user_id: str = proto.Field(
        proto.STRING,
        number=1,
    )
    first_open_timestamp_micros: int = proto.Field(
        proto.INT64,
        number=2,
    )
    user_properties: MutableMapping[str, 'UserPropertyValue'] = proto.MapField(
        proto.STRING,
        proto.MESSAGE,
        number=3,
        message='UserPropertyValue',
    )
    device_info: 'DeviceInfo' = proto.Field(
        proto.MESSAGE,
        number=4,
        message='DeviceInfo',
    )
    geo_info: 'GeoInfo' = proto.Field(
        proto.MESSAGE,
        number=5,
        message='GeoInfo',
    )
    app_info: 'AppInfo' = proto.Field(
        proto.MESSAGE,
        number=6,
        message='AppInfo',
    )
    traffic_source: 'TrafficSource' = proto.Field(
        proto.MESSAGE,
        number=7,
        message='TrafficSource',
    )
    bundle_info: 'ExportBundleInfo' = proto.Field(
        proto.MESSAGE,
        number=8,
        message='ExportBundleInfo',
    )
    ltv_info: 'LtvInfo' = proto.Field(
        proto.MESSAGE,
        number=9,
        message='LtvInfo',
    )


class UserPropertyValue(proto.Message):
    r"""Predefined (eg: LTV) or custom properties (eg: birthday)
    stored on client side and associated with subsequent HitBundles.

    Attributes:
        value (google.events.firebase.analytics_v1.types.AnalyticsValue):
            Last set value of user property.
        set_timestamp_usec (int):
            UTC client time when user property was last
            set.
        index (int):
            Index for user property (one-based).
    """

    value: 'AnalyticsValue' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='AnalyticsValue',
    )
    set_timestamp_usec: int = proto.Field(
        proto.INT64,
        number=2,
    )
    index: int = proto.Field(
        proto.INT32,
        number=3,
    )


class AnalyticsValue(proto.Message):
    r"""Value for Event Params and UserProperty can be of type string
    or int or float or double.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        string_value (str):

            This field is a member of `oneof`_ ``param_value``.
        int_value (int):

            This field is a member of `oneof`_ ``param_value``.
        float_value (float):

            This field is a member of `oneof`_ ``param_value``.
        double_value (float):

            This field is a member of `oneof`_ ``param_value``.
    """

    string_value: str = proto.Field(
        proto.STRING,
        number=1,
        oneof='param_value',
    )
    int_value: int = proto.Field(
        proto.INT64,
        number=2,
        oneof='param_value',
    )
    float_value: float = proto.Field(
        proto.FLOAT,
        number=3,
        oneof='param_value',
    )
    double_value: float = proto.Field(
        proto.DOUBLE,
        number=4,
        oneof='param_value',
    )


class DeviceInfo(proto.Message):
    r"""Message containing device informations.

    Attributes:
        device_category (str):
            Device category.
            Eg. tablet or mobile.
        mobile_brand_name (str):
            Device brand name.
            Eg. Samsung, HTC, etc.
        mobile_model_name (str):
            Device model name.
            Eg. GT-I9192
        mobile_marketing_name (str):
            Device marketing name.
            Eg. Galaxy S4 Mini
        device_model (str):
            Device model.
            Eg. GT-I9192
        platform_version (str):
            Device OS version when data capture ended.
            Eg. 4.4.2
        device_id (str):
            Vendor specific device identifier. This is
            IDFV on iOS. Not used for Android.
            Example: "599F9C00-92DC-4B5C-9464-7971F01F8370".
        resettable_device_id (str):
            The type of the resettable_device_id is always IDFA on iOS
            and AdId on Android. Example:
            "71683BF9-FA3B-4B0D-9535-A1F05188BAF3".
        user_default_language (str):
            The user language.
            Eg. "en-us", "en-za", "zh-tw", "jp".
        device_time_zone_offset_seconds (int):
            The timezone of the device when data was
            uploaded as seconds skew from UTC.
        limited_ad_tracking (bool):
            The device's Limit Ad Tracking setting. When true, we cannot
            use device_id for remarketing, demographics or influencing
            ads serving behaviour. However, we can use device_id for
            conversion tracking and campaign attribution.
    """

    device_category: str = proto.Field(
        proto.STRING,
        number=1,
    )
    mobile_brand_name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    mobile_model_name: str = proto.Field(
        proto.STRING,
        number=3,
    )
    mobile_marketing_name: str = proto.Field(
        proto.STRING,
        number=4,
    )
    device_model: str = proto.Field(
        proto.STRING,
        number=12,
    )
    platform_version: str = proto.Field(
        proto.STRING,
        number=6,
    )
    device_id: str = proto.Field(
        proto.STRING,
        number=7,
    )
    resettable_device_id: str = proto.Field(
        proto.STRING,
        number=8,
    )
    user_default_language: str = proto.Field(
        proto.STRING,
        number=9,
    )
    device_time_zone_offset_seconds: int = proto.Field(
        proto.INT32,
        number=10,
    )
    limited_ad_tracking: bool = proto.Field(
        proto.BOOL,
        number=11,
    )


class AppInfo(proto.Message):
    r"""Message which contains App Information.

    Attributes:
        app_version (str):
            The app's version name
            Examples: "1.0", "4.3.1.1.213361", "2.3
            (1824253)", "v1.8b22p6".
        app_instance_id (str):
            Unique id for this instance of the app.
            Example: "71683BF9FA3B4B0D9535A1F05188BAF3".
        app_store (str):
            The identifier of the store that installed
            the app. Eg. "com.sec.android.app.samsungapps",
            "com.amazon.venezia", "com.nokia.nstore".
        app_platform (str):
            The app platform.
            Eg "ANDROID", "IOS".
        app_id (str):
            Unique application identifier within an app
            store.
    """

    app_version: str = proto.Field(
        proto.STRING,
        number=1,
    )
    app_instance_id: str = proto.Field(
        proto.STRING,
        number=2,
    )
    app_store: str = proto.Field(
        proto.STRING,
        number=3,
    )
    app_platform: str = proto.Field(
        proto.STRING,
        number=4,
    )
    app_id: str = proto.Field(
        proto.STRING,
        number=5,
    )


class GeoInfo(proto.Message):
    r"""User's geographic informaiton.

    Attributes:
        continent (str):
            The geographic continent.
            Eg. Americas
        country (str):
            The geographic country.
            Eg. Brazil
        region (str):
            The geographic region.
            Eg. State of Sao Paulo
        city (str):
            The geographic city.
            Eg. Sao Paulo
    """

    continent: str = proto.Field(
        proto.STRING,
        number=1,
    )
    country: str = proto.Field(
        proto.STRING,
        number=2,
    )
    region: str = proto.Field(
        proto.STRING,
        number=3,
    )
    city: str = proto.Field(
        proto.STRING,
        number=4,
    )


class TrafficSource(proto.Message):
    r"""Mesage containing marketing campaign information which
    acquired the user.

    Attributes:
        user_acquired_campaign (str):
            The name of the campaign which acquired the
            user.
        user_acquired_source (str):
            The name of the network which acquired the
            user.
        user_acquired_medium (str):
            The name of the medium which acquired the
            user.
    """

    user_acquired_campaign: str = proto.Field(
        proto.STRING,
        number=2,
    )
    user_acquired_source: str = proto.Field(
        proto.STRING,
        number=3,
    )
    user_acquired_medium: str = proto.Field(
        proto.STRING,
        number=4,
    )


class ExportBundleInfo(proto.Message):
    r"""Message containing information regarding the bundle in which
    these events were uploaded.

    Attributes:
        bundle_sequence_id (int):
            Monotonically increasing index for each
            bundle set by SDK.
        server_timestamp_offset_micros (int):
            Timestamp offset between collection time and
            upload time.
    """

    bundle_sequence_id: int = proto.Field(
        proto.INT32,
        number=1,
    )
    server_timestamp_offset_micros: int = proto.Field(
        proto.INT64,
        number=2,
    )


class LtvInfo(proto.Message):
    r"""Lifetime Value information about this user.

    Attributes:
        revenue (float):
            The Lifetime Value revenue of this user.
        currency (str):
            The currency corresponding to the revenue.
    """

    revenue: float = proto.Field(
        proto.DOUBLE,
        number=1,
    )
    currency: str = proto.Field(
        proto.STRING,
        number=2,
    )


class EventDimensions(proto.Message):
    r"""Message containing information pertaining to the event.

    Attributes:
        date (str):
            The date on which this event was logged.
            (YYYYMMDD format in the registered timezone of
            your app.)
        name (str):
            The name of this event.
        params (MutableMapping[str, google.events.firebase.analytics_v1.types.AnalyticsValue]):
            A repeated record of the parameters
            associated with this event.
        timestamp_micros (int):
            UTC client time when the event happened.
        previous_timestamp_micros (int):
            UTC client time when the previous event
            happened.
        value_in_usd (float):
            Value param in USD.
    """

    date: str = proto.Field(
        proto.STRING,
        number=6,
    )
    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    params: MutableMapping[str, 'AnalyticsValue'] = proto.MapField(
        proto.STRING,
        proto.MESSAGE,
        number=2,
        message='AnalyticsValue',
    )
    timestamp_micros: int = proto.Field(
        proto.INT64,
        number=4,
    )
    previous_timestamp_micros: int = proto.Field(
        proto.INT64,
        number=5,
    )
    value_in_usd: float = proto.Field(
        proto.DOUBLE,
        number=7,
    )


__all__ = tuple(sorted(__protobuf__.manifest))
