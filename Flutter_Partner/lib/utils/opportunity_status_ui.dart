import 'package:flutter/material.dart';

/// UI-only mapping for Opportunity Lifecycle statuses.

///
/// - Does NOT modify backend business logic.
/// - Accepts various raw values (enum strings, labels, etc.)
///   and returns a user-friendly label + consistent colors.
class OpportunityStatusUi {
  const OpportunityStatusUi._();

  static const String draft = 'Draft';
  static const String active = 'Active';
  static const String reviewingParticipants = 'Reviewing Participants';
  static const String inProgress = 'In Progress';
  static const String fullyFunded = 'Fully Funded';
  static const String paused = 'Paused';
  static const String completed = 'Completed';
  static const String archived = 'Archived';

  static const List<String> allStatuses = [
    draft,
    active,
    reviewingParticipants,
    inProgress,
    fullyFunded,
    paused,
    completed,
    archived,
  ];

  static String labelFromRaw(dynamic raw) {
    final normalized = _normalize(raw);
    if (normalized == null) return draft;

    switch (normalized) {
      case 'draft':
        return draft;
      case 'active':
        return active;
      case 'reviewing_participants':
      case 'reviewingparticipants':
      case 'reviewing participants':
        return reviewingParticipants;
      case 'in_progress':
      case 'inprogress':
      case 'in progress':
        return inProgress;
      case 'fully_funded':
      case 'fullyfunded':
      case 'fully funded':
        return fullyFunded;
      case 'paused':
        return paused;
      case 'completed':
        return completed;
      case 'archived':
        return archived;
      default:
        if (normalized.contains('draft')) return draft;
        if (normalized.contains('active')) return active;
        if (normalized.contains('review')) return reviewingParticipants;
        if (normalized.contains('progress')) return inProgress;
        if (normalized.contains('funded')) return fullyFunded;
        if (normalized.contains('pause')) return paused;
        if (normalized.contains('complete')) return completed;
        if (normalized.contains('archive')) return archived;
        return draft;
    }
  }

  static Color colorFor(dynamic raw) {
    final label = labelFromRaw(raw);
    switch (label) {
      case draft:
        return Colors.grey;
      case active:
        return Colors.green;
      case reviewingParticipants:
        return Colors.blue;
      case inProgress:
        return const Color(0xFF7C3AED);
      case fullyFunded:
        return const Color(0xFF10B981);
      case paused:
        return const Color(0xFFF97316);
      case completed:
        return const Color(0xFF14B8A6);
      case archived:
        return const Color(0xFF475569);
      default:
        return Colors.grey;
    }
  }

  static Color backgroundFor(dynamic raw) => colorFor(raw).withOpacity(0.14);
  static Color borderFor(dynamic raw) => colorFor(raw).withOpacity(0.28);

  static Widget badge({
    required dynamic raw,
    double radius = 10,
    TextStyle? textStyle,
    EdgeInsets padding =
        const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
  }) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundFor(raw),
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: borderFor(raw), width: 1),
      ),
      child: Text(
        labelFromRaw(raw),
        style: textStyle ??
            TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: colorFor(raw),
            ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  static String? _normalize(dynamic raw) {
    if (raw == null) return null;
    final s = raw.toString().trim();
    if (s.isEmpty) return null;

    final lastPart = s.contains('.') ? s.split('.').last : s;

    return lastPart
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replaceAll(RegExp(r'\s+'), ' ')
        .toLowerCase();
  }
}
