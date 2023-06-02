import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {guidFor} from '@ember/object/internals';
import {setting} from 'clubhouse/utils/setting';

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
  elementInsertedEvent() {
    const editorUrl = setting('EditorUrl');

    if (!editorUrl) {
      this.didError = true;
      this.isLoading = false;
      return;
    }
    this.house.loadScript(editorUrl).then(() => {
      this.isReady = true;
      window.tinymce.init({
        selector: '#' + this.elementId,
        init_instance_callback: (editor) => {
          this.editor = editor;
          editor.on('Change', () => this.args.onChange(editor.getContent()));
        },
        plugins: 'print preview paste  searchreplace autolink  visualblocks visualchars fullscreen link media table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount textpattern help charmap emoticons',
        menubar: 'edit view insert format tools table tc help',
        toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | a11ycheck ltr rtl | showcomments addcomment',
        image_advtab: true,
        height: 600,
      //  image_caption: true,
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        toolbar_mode: 'sliding',
        contextmenu: 'link image imagetools table configurepermanentpen',
      });
    }).catch(() => {
      this.didError = true;
      if (this.args.onLoadError) {
        this.args.onLoadError();
      }
    }).finally(() => {
      this.isLoading = false;
    });
  }

  willDestroy() {
    super.willDestroy(...arguments);

    if (this.editor) {
      this.editor.remove('#' + this.elementId);
    }
  }
}
