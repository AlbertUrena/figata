# Analytics Taxonomy

> Read this doc when adding a new event, changing event naming, or wiring a route/module to the analytics SDK.

## Naming Rules

- Event names use `snake_case`.
- Event versioning is explicit in the envelope via `event_version`.
- One semantic action maps to one canonical event.
- Route-specific aliases are forbidden unless listed as legacy compatibility events.

Canonical source of truth: `shared/analytics-taxonomy.js`

## Base Envelope

Every event must include:
- `event_id`
- `event_name`
- `event_version`
- `schema_version`
- `occurred_at`
- `environment`
- `page_path`
- `page_type`
- `route_name`
- `site_section`
- `visitor_id`
- `session_id`
- `entry_source`
- `visit_context`
- `visit_context_confidence`
- `is_internal`
- `traffic_class`

## Event Families

| Family | Purpose | Example events |
|-------|---------|----------------|
| Lifecycle | Session and route baselines | `session_start`, `page_view`, `page_exit`, `source_attribution_resolved` |
| Navigation | Global navigation and CTA behavior | `nav_link_click`, `burger_menu_toggle`, `cta_click`, `scroll_milestone`, `section_view` |
| Menu commerce | Commercial funnel and item intent | `item_impression`, `item_detail_open`, `add_to_cart`, `begin_checkout`, `purchase` |
| Editorial decision | Story, pairing, gallery, video, comparison behavior | `item_story_view`, `item_pairing_view`, `item_gallery_expand`, `item_video_complete` |
| Performance | Route and asset timing correlated to intent | `route_ready`, `performance_summary`, `asset_load_timing`, `network_context_sample` |
| In-store context | Wi-Fi assist and confidence reinforcement | `wifi_assist_shown`, `wifi_assist_dismissed`, `wifi_assist_copy_password`, `wifi_assist_cta_click`, `visit_context_confirmed` |
| Replay / optimization | Sampling and future experiment hooks | `replay_sampled`, `experiment_exposure`, `recommendation_click` |
| Admin / AI | Aggregated analytics consumption surfaces | `report_generated`, `ai_chat_question`, `ai_chat_answered` |

## Core Event Coverage

| Event | Required event-specific properties | Typical origin |
|------|------------------------------------|----------------|
| `session_start` | `session_sequence`, `navigation_type` | SDK bootstrap |
| `page_view` | `page_title`, `navigation_type` | route bootstrap |
| `page_exit` | `engagement_time_ms` | page lifecycle hooks |
| `source_attribution_resolved` | `entry_source_detail`, `source_medium`, `source_campaign` | attribution runtime |
| `section_view` | `section_id`, `section_name`, `section_index` | section observer |
| `scroll_milestone` | `scroll_percent`, `scroll_milestone_name` | throttled scroll observer |
| `nav_link_click` | `nav_location`, `cta_id`, `cta_label`, `cta_target` | navbar and burger runtimes |
| `cta_click` | `cta_id`, `cta_label`, `cta_target`, `cta_category` | any global CTA |
| `item_impression` | `item_id`, `item_name`, `category`, `list_id`, `list_name`, `list_position` | menu/home list renderers |
| `item_detail_open` | `item_id`, `item_name`, `category`, `detail_origin` | menu detail/open handlers |
| `add_to_cart` | `item_id`, `item_name`, `category`, `price`, `quantity` | menu/cart actions |
| `purchase` | `order_id`, `currency`, `value`, `items` | checkout confirmation |
| `item_story_view` | `item_id`, `item_name`, `story_id` | detail editorial panel |
| `item_video_play` | `item_id`, `item_name`, `media_id`, `media_duration_ms` | detail/home/event video blocks |
| `performance_summary` | `fcp_ms`, `dom_interactive_ms`, `route_ready_ms`, `network_effective_type` | performance collector |
| `wifi_assist_shown` | `wifi_assist_reason`, `visit_context_before` | in-store UX runtime |
| `wifi_assist_dismissed` | `wifi_assist_reason`, `wifi_assist_action` | in-store UX runtime |
| `wifi_assist_copy_password` | `wifi_assist_reason`, `wifi_assist_action` | in-store UX runtime |
| `wifi_assist_cta_click` | `wifi_assist_reason`, `wifi_assist_action`, `cta_target` | in-store UX runtime |
| `visit_context_confirmed` | `visit_context_before`, `visit_context`, `visit_context_confidence` | in-store context reinforcement |
| `replay_sampled` | `replay_tool`, `replay_sample_key`, `replay_sample_rate` | shared replay runtime |
| `report_generated` | `report_type`, `report_period`, `report_status` | automation/backend |
| `ai_chat_question` | `question_template_id`, `question_tokens`, `response_scope` | admin analytics chat |
| `experiment_exposure` | `experiment_id`, `variant_id`, `experiment_goal` | future experimentation runtime |

## Property Domains

| Domain | Example properties |
|-------|---------------------|
| Identity | `visitor_id`, `session_id`, `session_sequence`, `is_returning_visitor` |
| Source | `entry_source`, `entry_source_detail`, `source_medium`, `source_campaign`, `referrer_host` |
| Route | `page_path`, `page_type`, `route_name`, `site_section`, `navigation_type` |
| CTA | `cta_id`, `cta_label`, `cta_target`, `cta_category`, `nav_location` |
| Commerce | `item_id`, `item_name`, `category`, `price`, `quantity`, `currency`, `value`, `items` |
| Editorial | `story_id`, `pairing_id`, `media_id`, `media_duration_ms`, `detail_depth_index` |
| Performance | `fcp_ms`, `route_ready_ms`, `network_effective_type`, `network_downlink_mbps`, `asset_size_bytes`, `page_shell_visible_ms`, `menu_tabs_visible_ms`, `detail_image_visible_ms` |
| Wi-Fi / in-store | `wifi_assist_reason`, `wifi_assist_action`, `visit_context_before` |
| Context | `visit_context`, `visit_context_confidence`, `is_internal`, `traffic_class` |
| Optimization | `replay_tool`, `replay_sample_key`, `replay_sample_rate`, `replay_capture_mode`, `review_cadence_days` |
| Admin/AI | `report_type`, `question_template_id`, `experiment_id`, `variant_id` |

## Versioning And Deprecation

| Status | Rule |
|-------|------|
| `active` | Event can be emitted by runtime and used in reporting |
| `compatibility` | Event exists only as legacy alias or migration bridge |
| `planned` | Event defined now to protect future schema work, but not emitted yet |
| `deprecated` | Event kept for historical interpretation only |

Current compatibility aliases:
- `whatsapp_click` -> canonical source event is `cta_click` with `cta_category="whatsapp"`.
- `reserve_click` -> canonical source event is `cta_click` with `cta_category="reservation"`.
- `delivery_click` -> canonical source event is `cta_click` with `cta_category="delivery"`.
- `event_interest_click` -> canonical source event is `cta_click` with `cta_category="events"`.

## Source Mapping Guidance

| Surface | Preferred event |
|--------|------------------|
| Shared navbar links | `nav_link_click` |
| Hero / sticky / footer CTA | `cta_click` |
| Menu grid exposure | `item_impression` |
| Menu detail/editorial | `item_detail_open`, editorial family events |
| Performance observer | `route_ready`, `performance_summary`, `asset_load_timing` |
| Admin AI/reporting | admin/AI family events |

## Review Rule

A new analytics event is only valid when:
- it is added to `shared/analytics-taxonomy.js`,
- its properties exist in the property registry,
- its payload validates through `shared/analytics-contract.js`,
- and it passes governance in `shared/analytics-governance.js`.
