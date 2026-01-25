import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/color_extensions.dart';
import '../services/mock_data.dart';
import '../theme/app_theme.dart';

// Deterministic color generator for category labels so slices and legends match.
Color colorForLabel(String label) {
  final hash = label.hashCode;
  final hue = (hash & 0xFFFF) % 360;
  return HSVColor.fromAHSV(1.0, hue.toDouble(), 0.58, 0.92).toColor();
}

typedef SliceTapCallback = void Function(int index);

class SimplePieChart extends StatefulWidget {
  final List<Category> categories;
  final double size;
  final SliceTapCallback? onSliceTap;

  const SimplePieChart(
      {super.key, required this.categories, this.size = 180, this.onSliceTap});

  @override
  State<SimplePieChart> createState() => _SimplePieChartState();
}

class _SimplePieChartState extends State<SimplePieChart> {
  int? _selected;

  @override
  Widget build(BuildContext context) {
    final total = widget.categories.fold<double>(0, (s, c) => s + c.percent);
    // If there's no data or total is zero, show a placeholder instead of attempting to draw the pie.
    if (widget.categories.isEmpty || total <= 0) {
      final theme = Theme.of(context);
      return SizedBox(
        width: widget.size,
        height: widget.size,
        child: Container(
          decoration: BoxDecoration(
              color: Colors.white10,
              borderRadius: BorderRadius.circular(widget.size / 2)),
          child: Center(
              child: Text('No data',
                  style: theme.textTheme.bodySmall
                      ?.copyWith(color: Colors.white70))),
        ),
      );
    }

    return GestureDetector(
      onTapUp: (details) {
        final box = context.findRenderObject() as RenderBox;
        final local = box.globalToLocal(details.globalPosition);
        final center = Offset(widget.size / 2, widget.size / 2);
        final dx = local.dx - center.dx;
        final dy = local.dy - center.dy;
        final dist = sqrt(dx * dx + dy * dy);
        if (dist > widget.size / 2) return;
        var angle = atan2(dy, dx);
        angle = angle < -pi / 2 ? angle + 2 * pi : angle; // normalize
        // convert to 0..2pi starting from -pi/2 top
        const startAt = -pi / 2;
        var a = angle - startAt;
        if (a < 0) a += 2 * pi;
        var acc = 0.0;
        for (var i = 0; i < widget.categories.length; i++) {
          final sweep = (widget.categories[i].percent / total) * 2 * pi;
          if (a >= acc && a <= acc + sweep) {
            setState(() => _selected = i);
            if (widget.onSliceTap != null) widget.onSliceTap!(i);
            return;
          }
          acc += sweep;
        }
      },
      child: SizedBox(
        width: widget.size,
        height: widget.size,
        child: CustomPaint(
          painter: _PiePainter(widget.categories, selected: _selected),
        ),
      ),
    );
  }
}

class _PiePainter extends CustomPainter {
  final List<Category> categories;
  final int? selected;

  _PiePainter(this.categories, {this.selected});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width, size.height) / 2;
    final paint = Paint()..style = PaintingStyle.fill;
    final total = categories.fold<double>(0, (s, c) => s + c.percent);
    var startAngle = -pi / 2;
    for (var i = 0; i < categories.length; i++) {
      final sweep = (categories[i].percent / total) * 2 * pi;
      final baseColor = categories[i].name.isNotEmpty
          ? colorForLabel(categories[i].name)
          : AppPalette.purpleAccent;
      paint.color = baseColor.withOpacityCompat(selected == i ? 1.0 : 0.95);
      final r = selected == i ? radius * 1.08 : radius;
      final rect = Rect.fromCircle(center: center, radius: r);
      canvas.drawArc(rect, startAngle, sweep, true, paint);
      startAngle += sweep;
    }
    // draw center hole
    final holePaint = Paint()..color = Colors.white;
    canvas.drawCircle(center, radius * 0.28, holePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
