/* eslint-disable @typescript-eslint/unbound-method */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EpgListComponent, EpgData } from './epg-list.component';
import { MatListModule } from '@angular/material/list';
import { MockModule } from 'ng-mocks';
import { ElectronService } from '../../../services/electron.service';
import { ElectronServiceStub } from '../../../home/home.component.spec';
import * as moment from 'moment';
import { EPG_GET_PROGRAM_DONE } from '../../../shared/ipc-commands';
import { ChannelStore } from '../../../state';

describe('EpgListComponent', () => {
    let component: EpgListComponent;
    let fixture: ComponentFixture<EpgListComponent>;
    let electronService: ElectronService;
    let channelStore: ChannelStore;

    const MOCKED_PROGRAMS = {
        channel: {
            id: '12345',
            name: [
                {
                    lang: 'ab',
                    value: 'test me',
                },
                {
                    lang: 'ar',
                    value: 'ar test',
                },
            ],
            icon: [],
            url: [],
        },
        items: [
            {
                start: moment(Date.now()).format('YYYYMMDD'),
                stop: moment(Date.now()).format('YYYYMMDD'),
                channel: '12345',
                title: [{ lang: 'en', value: 'NOW on PBS' }],
                desc: [
                    {
                        lang: 'en',
                        value:
                            "Jordan's Queen Rania has made job creation a priority to help curb the staggering unemployment rates among youths in the Middle East.",
                    },
                ],
                date: ['20080711'],
                category: [
                    { lang: 'en', value: 'Newsmagazine' },
                    { lang: 'en', value: 'Interview' },
                ],
                episodeNum: [
                    { system: 'dd_progid', value: 'EP01006886.0028' },
                    { system: 'onscreen', value: '427' },
                ],
                previouslyShown: [{ start: '20080711000000' }],
                subtitles: [{ type: 'teletext' }],
                rating: [
                    {
                        system: 'VCHIP',
                        value: 'TV-G',
                    },
                ],
                credits: [
                    {
                        role: 'actor',
                        name: 'Peter Bergman',
                    },
                ],
                icon: [
                    'http://imageswoapi.whatsonindia.com/WhatsOnTV/images/ProgramImages/xlarge/38B4DE4E9A7132257749051B6C8B4F699DB264F4V.jpg',
                ],
                audio: [],
            },
        ],
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EpgListComponent],
            imports: [MockModule(MatListModule)],
            providers: [
                { provide: ElectronService, useClass: ElectronServiceStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EpgListComponent);
        component = fixture.componentInstance;
        electronService = TestBed.inject(ElectronService);
        channelStore = TestBed.inject(ChannelStore);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle epg programs', () => {
        component.handleEpgData({ payload: MOCKED_PROGRAMS });
        fixture.detectChanges();
        expect(component.timeNow).toBeTruthy();
        expect(component.dateToday).toBeTruthy();
        expect(component.channel).toBeTruthy();
        expect(component.items).toHaveLength(1);
    });

    it('should handle an empty epg programs object', () => {
        const payload = ({} as unknown) as EpgData;
        component.handleEpgData({ payload });
        fixture.detectChanges();
        expect(component.timeNow).toBeFalsy();
        expect(component.dateToday).toBeFalsy();
        expect(component.channel).toBeNull();
        expect(component.items).toHaveLength(0);
    });

    it('should remove ipc listeners on destroy', () => {
        spyOn(electronService.ipcRenderer, 'removeAllListeners');
        component.ngOnDestroy();
        expect(
            electronService.ipcRenderer.removeAllListeners
        ).toHaveBeenCalledTimes(1);
        expect(
            electronService.ipcRenderer.removeAllListeners
        ).toHaveBeenCalledWith(EPG_GET_PROGRAM_DONE);
    });

    it('should set epg program as active', () => {
        spyOn(channelStore, 'setActiveEpgProgram');
        component.setEpgProgram(MOCKED_PROGRAMS.items[0], false);
        expect(channelStore.setActiveEpgProgram).toHaveBeenCalledTimes(1);
        expect(channelStore.setActiveEpgProgram).toHaveBeenCalledWith(
            MOCKED_PROGRAMS.items[0]
        );
    });

    it('should reset active epg program', () => {
        spyOn(channelStore, 'resetActiveEpgProgram');
        component.setEpgProgram(MOCKED_PROGRAMS.items[0], true);
        expect(channelStore.resetActiveEpgProgram).toHaveBeenCalledTimes(1);
    });
});
