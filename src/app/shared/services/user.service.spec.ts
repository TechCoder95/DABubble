import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { DatabaseService } from './database.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);

    it('should log out the guest user', () => {
      // Arrange
      const id = 'guestUserId';
      const deleteDataFromDBSpy = spyOn(TestBed.inject(DatabaseService), 'deleteDataFromDB').and.returnValue(Promise.resolve());
      const sessionStorageRemoveItemSpy = spyOn(sessionStorage, 'removeItem');
      const getUsersFromDBSpy = spyOn(service, 'getUsersFromDB').and.returnValue(Promise.resolve());

      // Act
      service.guestLogout();

      // Assert
      expect(deleteDataFromDBSpy).toHaveBeenCalledWith(service.collectionName, id);
      expect(sessionStorageRemoveItemSpy).toHaveBeenCalledWith('userLoginGuest');
      expect(getUsersFromDBSpy).toHaveBeenCalled();
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
