import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/utils/app_colors.dart';
import 'package:salon_2/utils/app_font_family.dart';

class DropdownWithSearch<T> extends StatelessWidget {
  final String title;
  final String placeHolder;
  final T selected;
  final List items;
  final EdgeInsets? selectedItemPadding;
  final TextStyle? selectedItemStyle;
  final TextStyle? dropdownHeadingStyle;
  final BoxDecoration? decoration, disabledDecoration;
  final double? searchBarRadius;
  final double? dialogRadius;
  final bool disabled;
  final String label;
  final Function onChanged;

  const DropdownWithSearch({
    super.key,
    required this.title,
    required this.placeHolder,
    required this.items,
    required this.selected,
    required this.onChanged,
    this.selectedItemPadding,
    this.selectedItemStyle,
    this.dropdownHeadingStyle,
    this.decoration,
    this.disabledDecoration,
    this.searchBarRadius,
    this.dialogRadius,
    required this.label,
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    return AbsorbPointer(
      absorbing: disabled,
      child: GestureDetector(
        onTap: () {
          showDialog(
            context: context,
            builder: (context) {
              return SearchDialog(
                placeHolder: placeHolder,
                title: title,
                searchInputRadius: searchBarRadius,
                dialogRadius: dialogRadius,
                titleStyle: dropdownHeadingStyle,
                items: items,
              );
            },
          ).then((value) {
            onChanged(value);
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10.5, vertical: 15),
          decoration: BoxDecoration(
            borderRadius: const BorderRadius.all(Radius.circular(12)),
            color: AppColors.textFieldBg,
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  selected.toString(),
                  overflow: TextOverflow.ellipsis,
                  style: selected.toString() == "Select Country" || selected.toString() == "Select State" || selected.toString() == "Select City"
                      ? TextStyle(
                          color: AppColors.greyText,
                          fontFamily: AppFontFamily.heeBo400,
                          fontSize: 15,
                        )
                      : selectedItemStyle,
                ),
              ),
              const Icon(Icons.keyboard_arrow_down_rounded)
            ],
          ),
        ),
      ),
    );
  }
}

class SearchDialog extends StatefulWidget {
  final String title;
  final String placeHolder;
  final List items;
  final TextStyle? titleStyle;
  final TextStyle? itemStyle;
  final double? searchInputRadius;
  final double? dialogRadius;

  const SearchDialog({
    super.key,
    required this.title,
    required this.placeHolder,
    required this.items,
    this.titleStyle,
    this.searchInputRadius,
    this.dialogRadius,
    this.itemStyle,
  });

  @override
  State<SearchDialog> createState() => _SearchDialogState();
}

class _SearchDialogState<T> extends State<SearchDialog> {
  TextEditingController textController = TextEditingController();
  late List filteredList;

  @override
  void initState() {
    filteredList = widget.items;
    textController.addListener(() {
      setState(() {
        if (textController.text.isEmpty) {
          filteredList = widget.items;
        } else {
          filteredList = widget.items.where((element) => element.toString().toLowerCase().contains(textController.text.toLowerCase())).toList();
        }
      });
    });
    super.initState();
  }

  @override
  void dispose() {
    textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CustomDialog(
      shape: RoundedRectangleBorder(
        borderRadius: widget.dialogRadius != null ? BorderRadius.circular(widget.dialogRadius!) : BorderRadius.circular(14),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(15),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 15),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              child: TextField(
                decoration: InputDecoration(
                  isDense: true,
                  prefixIcon: const Icon(Icons.search),
                  hintText: widget.placeHolder,
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.all(
                      widget.searchInputRadius != null ? Radius.circular(widget.searchInputRadius!) : const Radius.circular(5),
                    ),
                    borderSide: BorderSide(color: AppColors.primaryAppColor),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.all(
                      widget.searchInputRadius != null ? Radius.circular(widget.searchInputRadius!) : const Radius.circular(5),
                    ),
                    borderSide: BorderSide(color: AppColors.primaryAppColor),
                  ),
                ),
                style: widget.itemStyle ?? const TextStyle(fontSize: 14),
                controller: textController,
              ),
            ),
            const SizedBox(height: 5),
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.all(
                  widget.dialogRadius != null ? Radius.circular(widget.dialogRadius!) : const Radius.circular(5),
                ),
                child: ListView.builder(
                  itemCount: filteredList.length,
                  itemBuilder: (context, index) {
                    return InkWell(
                      onTap: () {
                        FocusScope.of(context).unfocus();
                        Navigator.pop(context, filteredList[index]);
                      },
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 25),
                        child: Text(
                          filteredList[index].toString(),
                          style: widget.itemStyle ??
                              TextStyle(
                                fontSize: 15,
                                fontFamily: AppFontFamily.heeBo600,
                                color: AppColors.appText,
                              ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
            Align(
              alignment: Alignment.bottomRight,
              child: TextButton(
                onPressed: () {
                  FocusScope.of(context).unfocus();
                  Navigator.pop(context);
                },
                child: Text(
                  'Close',
                  style: widget.titleStyle ??
                      TextStyle(
                        fontSize: 14,
                        fontFamily: AppFontFamily.heeBo500,
                        color: AppColors.primaryAppColor,
                      ),
                ),
              ).paddingOnly(right: 10, bottom: 7),
            ),
          ],
        ),
      ),
    );
  }
}

class CustomDialog extends StatelessWidget {
  const CustomDialog({
    super.key,
    this.child,
    this.insetAnimationDuration = const Duration(milliseconds: 100),
    this.insetAnimationCurve = Curves.decelerate,
    this.shape,
    this.constraints = const BoxConstraints(
      minWidth: 280.0,
      minHeight: 280.0,
      maxHeight: 400.0,
      maxWidth: 400.0,
    ),
  });

  final Widget? child;
  final Duration insetAnimationDuration;
  final Curve insetAnimationCurve;
  final ShapeBorder? shape;
  final BoxConstraints constraints;

  Color _getColor(BuildContext context) {
    return Theme.of(context).dialogBackgroundColor;
  }

  static const RoundedRectangleBorder _defaultDialogShape = RoundedRectangleBorder(
    borderRadius: BorderRadius.all(Radius.circular(2.0)),
  );

  @override
  Widget build(BuildContext context) {
    final DialogThemeData dialogTheme = DialogTheme.of(context);
    return AnimatedPadding(
      padding: MediaQuery.of(context).viewInsets + const EdgeInsets.symmetric(horizontal: 22.0, vertical: 24.0),
      duration: insetAnimationDuration,
      curve: insetAnimationCurve,
      child: MediaQuery.removeViewInsets(
        removeLeft: true,
        removeTop: true,
        removeRight: true,
        removeBottom: true,
        context: context,
        child: Center(
          child: ConstrainedBox(
            constraints: constraints,
            child: Material(
              elevation: 15.0,
              color: _getColor(context),
              type: MaterialType.card,
              shape: shape ?? dialogTheme.shape ?? _defaultDialogShape,
              child: child,
            ),
          ),
        ),
      ),
    );
  }
}
