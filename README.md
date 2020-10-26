# Sequential Text
 A Figma plugin that does one simple thing—it populates a range of text layers with a numeric sequence.

 To use it, select the appropriate text layers, enter the text that you want to appear in the first layer in your selection, then press **Update Text**. The plugin automatically identifies the suffix, how it should increment, and updates all the selected text layers with appropriately sequenced text.

It supports simple numbered suffixes, or more complex ranged suffixes with different separators.

Here are some examples of what a range of text layers would contain for a given input string.

| Input      | Output                                                    |
|:---------- |:--------------------------------------------------------- |
| 1          | 1, 2, 3, 4, etc.                                          |
| Label 1    | Label 1, Label 2, Label 3, Label 4, etc.                  |
| Faders 1-8 | Faders 1-8, Faders 9-16, Faders 17-24, Faders 25-32, etc. |
| 1/2        | 1/2, 3/4, 5/6, 7/8, etc.                                  |
| 1 & 2      | 1 & 2, 3 & 4, 5 & 6, 7 & 8                                |

## Limitations
It does not support sequential prefixes. You’ll get odd results if you try to use labels that begin with numbers as the plugin thinks the following text is a range separator. I may change the way the sequential elements are identified to be less automagical, and more explicit.
