import 'dart:io';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';

/// Screen used during investment creation to pick up to 5 images.
/// Returns the selected [List<XFile>] when popped.
class NewInvestmentImagesScreen extends StatefulWidget {
  final List<XFile> initial;
  const NewInvestmentImagesScreen({super.key, required this.initial});

  @override
  State<NewInvestmentImagesScreen> createState() =>
      _NewInvestmentImagesScreenState();
}

class _NewInvestmentImagesScreenState extends State<NewInvestmentImagesScreen> {
  final ImagePicker _picker = ImagePicker();
  late List<XFile> _images;

  static const int _maxImages = 5;

  @override
  void initState() {
    super.initState();
    _images = List<XFile>.from(widget.initial);
  }

  Future<void> _addImages() async {
    final remaining = _maxImages - _images.length;
    if (remaining <= 0) return;

    List<XFile> picked = [];
    try {
      final res = await _picker.pickMultiImage(imageQuality: 80);
      picked = res;
    } catch (_) {
      final XFile? single = await _picker.pickImage(
          source: ImageSource.gallery, imageQuality: 80);
      if (single != null) picked = [single];
    }
    if (picked.isEmpty) return;
    setState(() {
      _images.addAll(picked.take(remaining));
    });
  }

  void _removeAt(int index) {
    setState(() {
      _images.removeAt(index);
    });
  }

  Widget _buildGrid() {
    if (_images.isEmpty) {
      return Center(
        child: Text('No images selected',
            style: GoogleFonts.dmSans(
                color:
                    Theme.of(context).colorScheme.onSurface.withOpacity(0.6))),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: _images.length,
      itemBuilder: (ctx, i) {
        final x = _images[i];
        return Stack(
          fit: StackFit.expand,
          children: [
            Image.file(File(x.path),
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) =>
                    Container(color: Colors.grey[800])),
            Positioned(
              top: 6,
              right: 6,
              child: GestureDetector(
                onTap: () => _removeAt(i),
                child: Container(
                  decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      shape: BoxShape.circle),
                  padding: const EdgeInsets.all(4),
                  child: const Icon(Icons.close, size: 14, color: Colors.white),
                ),
              ),
            )
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final remaining = _maxImages - _images.length;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload Images'),
        actions: [
          TextButton(
            onPressed: _images.isEmpty
                ? null
                : () {
                    setState(() => _images.clear());
                  },
            child: Text('Clear',
                style:
                    TextStyle(color: Theme.of(context).colorScheme.onPrimary)),
          )
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Images (max $_maxImages)',
                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                Row(
                  children: [
                    Text('$remaining left',
                        style: GoogleFonts.dmSans(
                            color: Theme.of(context)
                                .colorScheme
                                .onSurface
                                .withOpacity(0.6))),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.add_a_photo_rounded),
                      label: const Text('Add Photos'),
                      onPressed: remaining <= 0 ? null : _addImages,
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(child: _buildGrid()),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context, widget.initial),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context, _images),
                    child: const Text('Done'),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
