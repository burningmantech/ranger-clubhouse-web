import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {guidFor} from '@ember/object/internals';

const PLUGINS = [
  'advlist',
  'anchor',
  'autolink',
  'charmap',
  'charmap',
  'emoticons',
  'emoticons/js/emojiimages.js',
  'emoticons/js/emojis.js',
  'fullscreen',
  'help',
  'insertdatetime',
  'link',
  'lists',
  'media',
  'nonbreaking',
  'pagebreak',
  'preview',
  'searchreplace',
  'table',
  'visualblocks',
  'visualchars',
  'wordcount',
];

export default class WysiwygEditorComponent extends Component {
  @service house;

  @tracked isLoading = false;
  @tracked isReady = false;
  @tracked didError = false;

  editor = null;

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.initialText = this.args.text;
    this.elementId = this.args.id ?? guidFor(this);
  }

  @action
  async elementInsertedEvent() {
    try {
      let editorModule = window.tinymce;
      if (!editorModule) {
        editorModule = (await import('tinymce')).default;

        await import('tinymce/themes/silver');
        await import('tinymce/icons/default');
        await import('tinymce/models/dom');
        await import('tinymce/skins/ui/oxide/skin.css');

        for (let i = 0; i < PLUGINS.length; i++) {
          await import(`tinymce/plugins/${PLUGINS[i]}`);
        }
      }

      const contentCSS = (await import('tinymce/skins/content/default/content.min.css?raw')).default;
      const uiCSS = (await import('tinymce/skins/ui/oxide/content.min.css?raw')).default;

      editorModule.init({
        selector: 'textarea#' + this.elementId,
        init_instance_callback: (editor) => {
          this.editor = editor;
          editor.on('Change', () => this.args.onChange(editor.getContent()));
        },
        plugins: 'preview searchreplace autolink  visualblocks visualchars fullscreen link media table charmap emoticons pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap emoticons',
        menubar: 'edit view insert format tools table tc help',
        toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | a11ycheck ltr rtl | showcomments addcomment',
        image_advtab: true,
        // height: 600,
        //  image_caption: true,
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        toolbar_mode: 'sliding',
        contextmenu: 'link image imagetools table configurepermanentpen',
        promotion: false,
        skin: false,
        content_css: false,
        content_style: uiCSS + '\n' + contentCSS,
      });
      this.isReady = true;
    } catch (response) {
      this.house.handleErrorResponse(response);
      this.didError = true;
      if (this.args.onLoadError) {
        this.args.onLoadError();
      }
    } finally {
      this.isLoading = false;
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);

    if (this.editor) {
      this.editor.remove('#' + this.elementId);
    }
  }
}
