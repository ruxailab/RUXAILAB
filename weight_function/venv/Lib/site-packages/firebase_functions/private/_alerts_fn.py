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
"""Internal utilities for Firebase Alert function types."""

# pylint: disable=protected-access,cyclic-import
import typing as _typing
import cloudevents.http as _ce
import util as _util
from firebase_functions.alerts import FirebaseAlertData

from functions_framework import logging as _logging


def plan_update_payload_from_ce_payload(payload: dict):
    from firebase_functions.alerts.billing_fn import PlanUpdatePayload
    return PlanUpdatePayload(
        notification_type=payload["notificationType"],
        billing_plan=payload["billingPlan"],
        principal_email=payload["principalEmail"],
    )


def plan_automated_update_payload_from_ce_payload(payload: dict):
    from firebase_functions.alerts.billing_fn import PlanAutomatedUpdatePayload
    return PlanAutomatedUpdatePayload(
        notification_type=payload["notificationType"],
        billing_plan=payload["billingPlan"],
    )


def in_app_feedback_payload_from_ce_payload(payload: dict):
    from firebase_functions.alerts.app_distribution_fn import InAppFeedbackPayload
    return InAppFeedbackPayload(
        feedback_report=payload["feedbackReport"],
        feedback_console_uri=payload["feedbackConsoleUri"],
        tester_name=payload.get("testerName"),
        tester_email=payload["testerEmail"],
        app_version=payload["appVersion"],
        text=payload["text"],
        screenshot_uri=payload.get("screenshotUri"),
    )


def new_tester_device_payload_from_ce_payload(payload: dict):
    from firebase_functions.alerts.app_distribution_fn import NewTesterDevicePayload
    return NewTesterDevicePayload(
        tester_name=payload["testerName"],
        tester_email=payload["testerEmail"],
        tester_device_model_name=payload["testerDeviceModelName"],
        tester_device_identifier=payload["testerDeviceIdentifier"],
    )


def threshold_alert_payload_from_ce_payload(payload: dict):
    from firebase_functions.alerts.performance_fn import ThresholdAlertPayload
    return ThresholdAlertPayload(
        event_name=payload["eventName"],
        event_type=payload["eventType"],
        metric_type=payload["metricType"],
        num_samples=payload["numSamples"],
        threshold_value=payload["thresholdValue"],
        threshold_unit=payload["thresholdUnit"],
        condition_percentile=payload.get("conditionPercentile"),
        app_version=payload.get("appVersion"),
        violation_value=payload["violationValue"],
        violation_unit=payload["violationUnit"],
        investigate_uri=payload["investigateUri"],
    )


def issue_from_ce_payload(payload: dict):
    from firebase_functions.alerts.crashlytics_fn import Issue
    return Issue(
        id=payload["id"],
        title=payload["title"],
        subtitle=payload["subtitle"],
        app_version=payload["appVersion"],
    )


def new_fatal_issue_payload_from_ce_payload(payload: dict):
    from firebase_functions.alerts.crashlytics_fn import NewFatalIssuePayload
    return NewFatalIssuePayload(issue=issue_from_ce_payload(payload["issue"]))


def new_nonfatal_issue_payload_from_ce_payload(payload: dict):
    from firebase_functions.alerts.crashlytics_fn import NewNonfatalIssuePayload
    return NewNonfatalIssuePayload(
        issue=issue_from_ce_payload(payload["issue"]))


def regression_alert_payload_from_ce_payload(payload: dict):
    from firebase_functions.alerts.crashlytics_fn import RegressionAlertPayload
    return RegressionAlertPayload(type=payload["type"],
                                  issue=issue_from_ce_payload(payload["issue"]),
                                  resolve_time=_util.timestamp_conversion(
                                      payload["resolveTime"]))


def trending_issue_details_from_ce_payload(payload: dict):
    from firebase_functions.alerts.crashlytics_fn import TrendingIssueDetails
    return TrendingIssueDetails(
        type=payload["type"],
        issue=issue_from_ce_payload(payload["issue"]),
        event_count=payload["eventCount"],
        user_count=payload["userCount"],
    )


def stability_digest_payload_from_ce_payload(payload: dict):
    from firebase_functions.alerts.crashlytics_fn import StabilityDigestPayload
    return StabilityDigestPayload(
        digest_date=_util.timestamp_conversion(payload["digestDate"]),
        trending_issues=[
            trending_issue_details_from_ce_payload(issue)
            for issue in payload["trendingIssues"]
        ])


def velocity_alert_payload_from_ce_payload(payload: dict):
    from firebase_functions.alerts.crashlytics_fn import VelocityAlertPayload
    return VelocityAlertPayload(
        issue=issue_from_ce_payload(payload["issue"]),
        create_time=_util.timestamp_conversion(payload["createTime"]),
        crash_count=payload["crashCount"],
        crash_percentage=payload["crashPercentage"],
        first_version=payload["firstVersion"],
    )


def new_anr_issue_payload_from_ce_payload(payload: dict):
    from firebase_functions.alerts.crashlytics_fn import NewAnrIssuePayload
    return NewAnrIssuePayload(issue=issue_from_ce_payload(payload["issue"]))


def firebase_alert_data_from_ce(event_dict: dict,) -> FirebaseAlertData:
    from firebase_functions.options import AlertType
    alert_type: str = event_dict["alerttype"]
    alert_payload = event_dict["payload"]
    if alert_type == AlertType.CRASHLYTICS_NEW_FATAL_ISSUE.value:
        alert_payload = new_fatal_issue_payload_from_ce_payload(alert_payload)
    elif alert_type == AlertType.CRASHLYTICS_NEW_NONFATAL_ISSUE.value:
        alert_payload = new_nonfatal_issue_payload_from_ce_payload(
            alert_payload)
    elif alert_type == AlertType.CRASHLYTICS_REGRESSION.value:
        alert_payload = regression_alert_payload_from_ce_payload(alert_payload)
    elif alert_type == AlertType.CRASHLYTICS_STABILITY_DIGEST.value:
        alert_payload = stability_digest_payload_from_ce_payload(alert_payload)
    elif alert_type == AlertType.CRASHLYTICS_VELOCITY.value:
        alert_payload = velocity_alert_payload_from_ce_payload(alert_payload)
    elif alert_type == AlertType.CRASHLYTICS_NEW_ANR_ISSUE.value:
        alert_payload = new_anr_issue_payload_from_ce_payload(alert_payload)
    elif alert_type == AlertType.BILLING_PLAN_UPDATE.value:
        alert_payload = plan_update_payload_from_ce_payload(alert_payload)
    elif alert_type == AlertType.BILLING_PLAN_AUTOMATED_UPDATE.value:
        alert_payload = plan_automated_update_payload_from_ce_payload(
            alert_payload)
    elif alert_type == AlertType.APP_DISTRIBUTION_NEW_TESTER_IOS_DEVICE.value:
        alert_payload = new_tester_device_payload_from_ce_payload(alert_payload)
    elif alert_type == AlertType.APP_DISTRIBUTION_IN_APP_FEEDBACK.value:
        alert_payload = in_app_feedback_payload_from_ce_payload(alert_payload)
    elif alert_type == AlertType.PERFORMANCE_THRESHOLD.value:
        alert_payload = threshold_alert_payload_from_ce_payload(alert_payload)
    else:
        _logging.warning(f"Unhandled Firebase Alerts alert type: {alert_type}")

    return FirebaseAlertData(
        create_time=_util.timestamp_conversion(event_dict["createTime"]),
        end_time=_util.timestamp_conversion(event_dict["endTime"])
        if "endTime" in event_dict else None,
        payload=alert_payload,
    )


def event_from_ce_helper(raw: _ce.CloudEvent, cls, app_id=True):
    event_attributes = raw._get_attributes()
    event_data: _typing.Any = raw.get_data()
    event_dict = {**event_data, **event_attributes}
    alert_type: str = event_dict["alerttype"]
    event_kwargs = {
        "alert_type": alert_type,
        "data": firebase_alert_data_from_ce(event_dict),
        "id": event_dict["id"],
        "source": event_dict["source"],
        "specversion": event_dict["specversion"],
        "subject": event_dict["subject"] if "subject" in event_dict else None,
        "time": _util.timestamp_conversion(event_dict["time"]),
        "type": event_dict["type"],
    }
    if app_id:
        event_kwargs["app_id"] = event_dict.get("appid")
    return cls(**event_kwargs)


def billing_event_from_ce(raw: _ce.CloudEvent):
    from firebase_functions.alerts.billing_fn import BillingEvent
    return event_from_ce_helper(raw, BillingEvent, app_id=False)


def performance_event_from_ce(raw: _ce.CloudEvent):
    from firebase_functions.alerts.performance_fn import PerformanceEvent
    return event_from_ce_helper(raw, PerformanceEvent)


def app_distribution_event_from_ce(raw: _ce.CloudEvent):
    from firebase_functions.alerts.app_distribution_fn import AppDistributionEvent
    return event_from_ce_helper(raw, AppDistributionEvent)


def crashlytics_event_from_ce(raw: _ce.CloudEvent):
    from firebase_functions.alerts.crashlytics_fn import CrashlyticsEvent
    return event_from_ce_helper(raw, CrashlyticsEvent)


def alerts_event_from_ce(raw: _ce.CloudEvent):
    from firebase_functions.alerts_fn import AlertEvent
    return event_from_ce_helper(raw, AlertEvent)
